'use server';

import { pool } from '@/lib/db';
import {
  obterDadosVideos,
  YouTubeVideoData,
} from '@/lib/youtube';

/* =========================================================
   UTIL
========================================================= */

function calcularIdade(dataISO: string | null) {
  if (!dataISO) {
    return { texto: 'Data N/A', dias: 0 };
  }

  const pub = new Date(dataISO);

  if (isNaN(pub.getTime())) {
    return { texto: 'Data inválida', dias: 0 };
  }

  const hoje = new Date();
  const diff = hoje.getTime() - pub.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dias >= 365) {
    return {
      texto: (dias / 365).toFixed(1) + ' anos',
      dias,
    };
  }

  return {
    texto: `${dias} dias`,
    dias,
  };
}

async function calcularTendencia(videoId: string) {
  const [rows]: any = await pool.query(
    `
    SELECT views, capturado_em
    FROM musicas_historico
    WHERE id_video = ?
    ORDER BY capturado_em DESC
    LIMIT 2
    `,
    [videoId]
  );

  if (!rows || rows.length < 2) {
    return {
      delta: 0,
      percent: 0,
      trend: 'stable' as const,
    };
  }

  const atual = Number(rows[0].views);
  const anterior = Number(rows[1].views);

  const delta = atual - anterior;
  const percent = anterior > 0 ? (delta / anterior) * 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (percent > 0.05) trend = 'up';
  else if (percent < -0.05) trend = 'down';

  return { delta, percent, trend };
}

function extrairVideoId(urlOuId: string): string | null {
  try {
    if (
      !urlOuId.includes('youtube') &&
      !urlOuId.includes('youtu.be')
    ) {
      return urlOuId;
    }

    const url = new URL(urlOuId);

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '');
    }

    return url.searchParams.get('v');
  } catch {
    return null;
  }
}

/* =========================================================
   BUSCAR MÚSICAS
========================================================= */

export async function buscarMusicasMonitoradas() {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        id_video,
        titulo,
        tags,
        tag_color
      FROM musicas
    `);

    if (!rows.length) {
      return {
        success: true,
        dados: [],
      };
    }

    const videoIds = rows.map((m: any) => m.id_video);
    const statsVideos = await obterDadosVideos(videoIds);

    const statsMap = new Map<string, YouTubeVideoData>();
    for (const video of statsVideos) {
      statsMap.set(video.videoId, video);
    }

    const musicasComStats = await Promise.all(
      rows.map(async (musica: any) => {
        const stats = statsMap.get(musica.id_video);
        const idadeData = calcularIdade(stats?.publishedAt || null);
        const tendencia = await calcularTendencia(musica.id_video);

        return {
          id_video: musica.id_video,
          titulo: musica.titulo || stats?.title || 'Sem título',
          tags: musica.tags || '',
          tag_color: musica.tag_color || '#3b82f6',

          views: stats?.views || 0,
          likes: stats?.likes || 0,
          comentarios: stats?.comments || 0,

          idade: idadeData.texto,
          idadeDias: idadeData.dias,

          thumbnail: stats?.thumbnail || '',

          trend: tendencia.trend,
          trendPercent: tendencia.percent,
          trendDelta: tendencia.delta,

          deltaViews: tendencia.delta,
          percentChange: tendencia.percent,
        };
      })
    );

    return {
      success: true,
      dados: musicasComStats,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      dados: [],
    };
  }
}

/* =========================================================
   CADASTRAR MÚSICA
========================================================= */

export async function cadastrarMusica(urlOuId: string) {
  try {
    const videoId = extrairVideoId(urlOuId);

    if (!videoId) {
      return { success: false, error: 'URL inválida' };
    }

    const dadosYoutube = await obterDadosVideos([videoId]);
    const video = dadosYoutube[0];

    if (!video) {
      return { success: false, error: 'Vídeo não encontrado' };
    }

    const [rows]: any = await pool.query(
      `
      SELECT id_video
      FROM pedidos_musicas
      WHERE id_video = ?
      `,
      [videoId]
    );

    if (rows.length > 0) {
      await pool.query(
        `
        UPDATE pedidos_musicas
        SET votos = votos + 1
        WHERE id_video = ?
        `,
        [videoId]
      );
    } else {
      await pool.query(
        `
        INSERT INTO pedidos_musicas
        (id_video, titulo_sugerido, votos)
        VALUES (?, ?, ?)
        `,
        [videoId, video.title, 1]
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      error: error?.message || 'Erro desconhecido',
    };
  }
}

/* =========================================================
   PEDIDOS POPULARES
========================================================= */

export async function buscarPedidosPopulares() {
  try {
    const [rows] = await pool.query(`
      SELECT id_video, titulo_sugerido, votos
      FROM pedidos_musicas
      WHERE votos >= 15
      ORDER BY votos DESC
    `);

    return { success: true, dados: rows };
  } catch (error) {
    console.error(error);

    return { success: false, dados: [] };
  }
}

/* =========================================================
   HISTÓRICO
========================================================= */

export async function obterHistoricoVideo(videoId: string) {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT
        views,
        likes,
        comentarios,
        capturado_em
      FROM musicas_historico
      WHERE id_video = ?
      ORDER BY capturado_em ASC
      `,
      [videoId]
    );

    if (!rows.length) {
      return {
        success: true,
        dados: [],
      };
    }

    const serie = rows.map((r: any) => ({
      date: new Date(r.capturado_em).toISOString().split('T')[0],
      views: Number(r.views),
      likes: Number(r.likes),
      comments: Number(r.comentarios),
    }));

    return {
      success: true,
      dados: serie,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      dados: [],
    };
  }
}

/* =========================================================
   PREVISÃO
========================================================= */

export async function preverCrescimento(videoId: string) {
  try {
    const [rows]: any = await pool.query(
      `
      SELECT views, capturado_em
      FROM musicas_historico
      WHERE id_video = ?
      ORDER BY capturado_em ASC
      `,
      [videoId]
    );

    if (rows.length < 2) {
      return {
        success: false,
        error: 'Poucos dados para previsão',
      };
    }

    const views = rows.map((r: any) => Number(r.views));
    const n = views.length;

    const Vn = views[n - 1];
    const V0 = views[0];

    const diasTotal =
      (new Date(rows[n - 1].capturado_em).getTime() -
        new Date(rows[0].capturado_em).getTime()) /
        (1000 * 60 * 60 * 24) || 1;

    const baseGrowth = (Vn - V0) / diasTotal;

    const m = Math.min(3, n - 1);
    const VshortStart = views[n - 1 - m];
    const gShort = (Vn - VshortStart) / m;
    const gLong = baseGrowth;

    const acceleration =
      gLong !== 0 ? (gShort - gLong) / gLong : 0;

    let growth = gShort;

    if (n < 5) {
      growth = baseGrowth;
    } else {
      if (acceleration > 0.25) {
        growth *= 1.2;
      } else if (acceleration < -0.25) {
        growth *= 0.8;
      }
    }

    function estimate(target: number) {
      if (growth <= 0) return null;
      return Math.ceil((target - Vn) / growth);
    }

    return {
      success: true,
      dados: {
        atual: Vn,
        growth,
        baseGrowth,
        gShort,
        gLong,
        acceleration,
        confianca:
          n < 5
            ? 'baixa'
            : Math.abs(acceleration) < 0.2
            ? 'media'
            : 'alta',
        metas: {
          '1M': estimate(1_000_000),
          '10M': estimate(10_000_000),
          '100M': estimate(100_000_000),
          '1B': estimate(1_000_000_000),
        },
      },
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: 'Erro no modelo de previsão',
    };
  }
}