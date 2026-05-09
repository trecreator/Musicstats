'use server';

import { pool } from '@/lib/db';
import {
  obterDadosVideos,
  YouTubeVideoData,
} from '@/lib/youtube';

/* =========================================================
   UTIL
========================================================= */

function calcularIdade(
  dataISO: string | null
) {
  if (!dataISO) {
    return {
      texto: 'Data N/A',
      dias: 0,
    };
  }

  const pub = new Date(dataISO);

  if (isNaN(pub.getTime())) {
    return {
      texto: 'Data inválida',
      dias: 0,
    };
  }

  const hoje = new Date();

  const diff =
    hoje.getTime() - pub.getTime();

  const dias = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  if (dias >= 365) {
    return {
      texto:
        (dias / 365).toFixed(1) +
        ' anos',

      dias,
    };
  }

  return {
    texto: `${dias} dias`,
    dias,
  };
}

/* =========================================================
   CADASTRAR MÚSICA
========================================================= */

export async function cadastrarMusica(
  urlOuId: string
) {
  try {
    const videoId =
      extrairVideoId(urlOuId);

    if (!videoId) {
      return {
        success: false,
        error: 'URL inválida',
      };
    }

    /*
      Busca no YouTube
    */
    const dadosYoutube =
      await obterDadosVideos([
        videoId,
      ]);

    const video =
      dadosYoutube[0];

    if (!video) {
      return {
        success: false,
        error:
          'Vídeo não encontrado',
      };
    }

    /*
      Verifica se já existe
    */
    const [rows]: any =
      await pool.query(
        `
        SELECT id_video
        FROM pedidos_musicas
        WHERE id_video = ?
        `,
        [videoId]
      );

    /*
      Incrementa votos
    */
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
      /*
        Cria novo pedido
      */
      await pool.query(
        `
        INSERT INTO pedidos_musicas
        (
          id_video,
          titulo_sugerido,
          votos
        )
        VALUES (?, ?, ?)
        `,
        [
          videoId,
          video.title,
          1,
        ]
      );
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(error);

    return {
      success: false,
      error:
        error?.message ||
        'Erro desconhecido',
    };
  }
}

/* =========================================================
   BUSCAR PEDIDOS
========================================================= */

export async function buscarPedidosPopulares() {
  try {
    const [rows] =
      await pool.query(
        `
        SELECT
          id_video,
          titulo_sugerido,
          votos
        FROM pedidos_musicas
        WHERE votos >= 15
        ORDER BY votos DESC
        `
      );

    return {
      success: true,
      dados: rows,
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
   BUSCAR MÚSICAS
========================================================= */

export async function buscarMusicasMonitoradas() {
  try {
    /*
      Busca dados locais
    */
    const [rows]: any =
      await pool.query(`
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

    /*
      Todos IDs numa request
    */
    const videoIds = rows.map(
      (m: any) => m.id_video
    );

    /*
      Busca YouTube
    */
    const statsVideos =
      await obterDadosVideos(
        videoIds
      );

    /*
      Mapa rápido
    */
    const statsMap = new Map<
      string,
      YouTubeVideoData
    >();

    for (const video of statsVideos) {
      statsMap.set(
        video.videoId,
        video
      );
    }

    /*
      Merge final
    */
    const musicasComStats =
      rows.map((musica: any) => {
        const stats =
          statsMap.get(
            musica.id_video
          );

        const idadeData =
          calcularIdade(
            stats?.publishedAt ||
              null
          );

        return {
          id_video:
            musica.id_video,

          titulo:
            musica.titulo ||
            stats?.title ||
            'Sem título',

          tags:
            musica.tags || '',

          tag_color:
            musica.tag_color ||
            '#3b82f6',

          views:
            stats?.views || 0,

          likes:
            stats?.likes || 0,

          comentarios:
            stats?.comments || 0,

          idade:
            idadeData.texto,

          idadeDias:
            idadeData.dias,

          thumbnail:
            stats?.thumbnail || '',
        };
      });

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
   EXTRATOR YOUTUBE
========================================================= */

function extrairVideoId(
  urlOuId: string
): string | null {
  try {
    /*
      Se já for ID puro
    */
    if (
      !urlOuId.includes(
        'youtube'
      ) &&
      !urlOuId.includes(
        'youtu.be'
      )
    ) {
      return urlOuId;
    }

    const url = new URL(
      urlOuId
    );

    /*
      youtu.be
    */
    if (
      url.hostname.includes(
        'youtu.be'
      )
    ) {
      return url.pathname.replace(
        '/',
        ''
      );
    }

    /*
      youtube.com/watch?v=
    */
    return url.searchParams.get(
      'v'
    );
  } catch {
    return null;
  }
}