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
          reject(new Error("Erro HTTP " + res.statusCode + " retornado pelo Google. Corpo da resposta: " + dados));
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
  const { searchParams } = new URL(request.url);
  const tokenUrl = searchParams.get("token");
  const tokenSecreto = (process.env.CRON_SECRET || "ms_121920eCCLk2978_sec_page_r9").trim();

  if (!tokenUrl || tokenUrl !== tokenSecreto) {
    return NextResponse.json({ error: "Acesso Não Autorizado via Token." }, { status: 401 });
  }

  if (!poolConfig) {
    return NextResponse.json({ error: "Configuração do Banco de Dados ausente no servidor." }, { status: 500 });
  }

  // Limpa completamente quebras de linha invisíveis vindas do arquivo .env
  const apiKey = process.env.YOUTUBE_API_KEY?.replace(/[\r\n]+/g, "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "A credencial YOUTUBE_API_KEY não foi encontrada ou está vazia." }, { status: 500 });
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
      // Filtra espaços e caracteres de quebra de linha dos IDs salvos no Banco
      const listaIds = lote
        .map((m: any) => m.id_video.replace(/[\r\n]+/g, "").trim())
        .filter((id: string) => id.length > 0);

      if (listaIds.length === 0) continue;

      const novaListaIdsSincronizada = listaIds.join(",");
      
      // Montagem limpa e manual da URL do Endpoint
      const urlYoutubeDefinitiva = `https://googleapis.com{novaListaIdsSincronizada}&key=${apiKey}`;

      // PRINT DE SEGURANÇA: Veja no terminal do VSCode como o NextJS está montando a sua URL!
      console.log("👉 URL ENVIADA AO GOOGLE:", urlYoutubeDefinitiva);

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

        await conexao.query(
          "UPDATE musicas SET views = ?, likes = ?, comentarios = ?, ultima_atualizacao = NOW() WHERE id_video = ?",
          [views, likes, comentarios, idVideo]
        );

        await conexao.query(
          "INSERT INTO musicas_historico (id_video, views, likes, comentarios, capturado_em) VALUES (?, ?, ?, ?, NOW())",
          [idVideo, views, likes, comentarios]
        );

        totalAtualizado++;
      }
    }

    await conexao.end();

    if (totalAtualizado === 0) {
      return NextResponse.json({ success: false, error: "Nenhum resultado retornado pelos servidores do YouTube." });
    }

    return NextResponse.json({ 
      success: true, 
      message: "[SUCESSO] Sincronização concluída! Total de " + totalAtualizado + " músicas atualizadas e registradas no histórico." 
    });

  } catch (error: any) {
    if (conexao) await conexao.end();
    return NextResponse.json({ 
      success: false, 
      error: error?.message || "Ocorreu um erro interno inesperado na rota Cron." 
    }, { status: 500 });
  }
}
