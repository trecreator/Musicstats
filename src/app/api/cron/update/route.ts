import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import https from "https";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const deNuvem = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;
const poolConfig = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : deNuvem 
    ? {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
      }
    : null;

function fazerRequisicaoHttps(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let dados = "";
      res.on("data", (chunk) => { dados += chunk; });
      res.on("end", () => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
          reject(new Error("Erro HTTP " + res.statusCode + " retornado pelo Google: " + dados));
          return;
        }
        try {
          resolve(JSON.parse(dados));
        } catch (e) {
          reject(new Error("O YouTube respondeu com sucesso, mas o corpo não era um JSON. Resposta: " + dados.substring(0, 200)));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

function dividirEmLotes<T>(array: T[], tamanho: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < array.length; i += tamanho) {
    lotes.push(array.slice(i, i + tamanho));
  }
  return lotes;
}

export async function GET(request: NextRequest) {
  // --- DIAGNÓSTICO ESTREITO DE SINAL DE CONTROLE E ENV VARS ---
  const validacaoEnv = {
    DATABASE_CONFIG_EXISTE: !!poolConfig,
    YOUTUBE_KEY_EXISTE: !!process.env.YOUTUBE_API_KEY,
    YOUTUBE_KEY_COMPRIMENTO: process.env.YOUTUBE_API_KEY?.length || 0,
    CRON_SECRET_EXISTE: !!process.env.CRON_SECRET,
  };

  const { searchParams } = new URL(request.url);
  const tokenUrl = searchParams.get("token");
  const tokenSecreto = (process.env.CRON_SECRET || "ms_121920eCCLk2978_sec_page_r9").trim();

  if (!tokenUrl || tokenUrl !== tokenSecreto) {
    return NextResponse.json({ error: "Acesso Não Autorizado via Token.", debug: validacaoEnv }, { status: 401 });
  }

  if (!poolConfig) {
    return NextResponse.json({ error: "Configuração do Banco de Dados ausente no Vercel.", debug: validacaoEnv }, { status: 500 });
  }

  // Limpa estritamente caracteres de quebra de linha da chave sem afetar o resto
  const apiKey = process.env.YOUTUBE_API_KEY?.replace(/[\r\n\s]+/g, "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "A credencial YOUTUBE_API_KEY está vazia.", debug: validacaoEnv }, { status: 500 });
  }

  const conexao = await mysql.createConnection(poolConfig);
  let totalAtualizado = 0;

  try {
    const [musicas] = await conexao.query<any[]>(
      "SELECT id_video FROM musicas WHERE id_video IS NOT NULL AND id_video != ''"
    );
    
    if (musicas.length === 0) {
      await conexao.end();
      return NextResponse.json({ success: true, message: "Banco vazio: nenhuma música para sincronização." });
    }

    const lotesDeMusicas = dividirEmLotes<any>(musicas, 50);

    for (const lote of lotesDeMusicas) {
      // Limpa individualmente os IDs para evitar que eles quebrem ou colem na URL base
      const listaIds = lote
        .map((m: any) => m.id_video.replace(/[\r\n\s]+/g, "").trim())
        .filter((id: string) => id.length > 0);

      if (listaIds.length === 0) continue;

      const novaListaIdsSincronizada = listaIds.join(",");
      
      // CONCATENAÇÃO PURA ISOLADA: Protegida de vazamentos ou colas de texto
      
      const urlYoutubeDefinitiva =
  `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${novaListaIdsSincronizada}&key=${apiKey}`;

      // Se o Google disparar erro, a resposta capturará a URL limpa que gerou o problema
      try {
        const dados = await fazerRequisicaoHttps(urlYoutubeDefinitiva);

        if (dados.error) {
          throw new Error("[Falha Google API]: " + (dados.error.message || JSON.stringify(dados.error)));
        }

        if (!dados.items || dados.items.length === 0) {
          continue;
        }

        for (const item of dados.items) {
          const idVideo = item.id;
          const stats = item.statistics;
          const views = Number(stats.viewCount || 0);
          const likes = Number(stats.likeCount || 0);
          const comentarios = Number(stats.commentCount || 0);
          const publishedAt = item.snippet?.publishedAt
  ? item.snippet.publishedAt
      .replace("T", " ")
      .replace("Z", "")
  : null;
          await conexao.query(
  `UPDATE musicas 
   SET views = ?, likes = ?, comentarios = ?, published_at = ?, ultima_atualizacao = NOW() 
   WHERE id_video = ?`,
  [views, likes, comentarios, publishedAt, idVideo]
);

// SALVA SNAPSHOT HISTÓRICO
await conexao.query(
  `INSERT INTO musicas_historico 
  (id_video, views, likes, comentarios)
  VALUES (?, ?, ?, ?)`,
  [idVideo, views, likes, comentarios]
);

totalAtualizado++;

          totalAtualizado++;
        }
      } catch (reqError: any) {
        throw new Error("Falha ao consultar URL: " + urlYoutubeDefinitiva + " | Erro Original: " + reqError.message);
      }
    }

    await conexao.end();

    if (totalAtualizado === 0) {
      return NextResponse.json({ success: false, error: "Nenhum resultado retornado pelos servidores do YouTube.", debug: validacaoEnv });
    }

    return NextResponse.json({ 
      success: true, 
      message: "[SUCESSO] Sincronização concluída! Total de " + totalAtualizado + " músicas atualizadas.",
      debug: validacaoEnv
    });

  } catch (error: any) {
    if (conexao) await conexao.end();
    return NextResponse.json({ 
      success: false, 
      error: error?.message || "Ocorreu um erro interno inesperado na rota.",
      debug: validacaoEnv
    }, { status: 500 });
  }
}
