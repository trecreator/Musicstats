import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenUrl = searchParams.get("token");
  const tokenSecreto = process.env.CRON_SECRET || "ms_121920eCCLk2978_sec_page_r9";

  if (!tokenUrl || tokenUrl !== tokenSecreto) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!poolConfig) {
    return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 500 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY ausente." }, { status: 500 });
  }

  const conexao = await mysql.createConnection(poolConfig);

  try {
    // 1. Coleta todas as músicas
    const [musicas] = await conexao.query<any[]>("SELECT id_video FROM musicas");
    
    if (musicas.length === 0) {
      await conexao.end();
      return NextResponse.json({ success: true, message: "Nenhuma música para atualizar." });
    }

    // 2. Transforma a lista de IDs em uma única string separada por vírgulas (ex: "id1,id2,id3")
    const listaIds = musicas.map(m => m.id_video).join(",");

    // 3. FAZ APENAS UM FETCH SEGURO PARA TODOS OS VÍDEOS DE UMA VEZ
    const urlYoutube = `https://googleapis.com{listaIds}&key=${apiKey}`;
    const resposta = await fetch(urlYoutube);
    
    if (!resposta.ok) {
      throw new Error(`Erro na API do YouTube: ${resposta.statusText}`);
    }
    
    const dados = await resposta.json();

    if (dados.items && dados.items.length > 0) {
      // 4. Grava os novos dados de cada vídeo no MySQL aproveitando a mesma conexão aberta
      for (const item of dados.items) {
        const idVideo = item.id;
        const stats = item.statistics;
        const views = Number(stats.viewCount || 0);
        const likes = Number(stats.likeCount || 0);
        const comentarios = Number(stats.commentCount || 0);

        await conexao.query(
          `UPDATE musicas SET views = ?, likes = ?, comentarios = ?, ultima_atualizacao = NOW() WHERE id_video = ?`,
          [views, likes, comentarios, idVideo]
        );
      }
    }

    await conexao.end();
    return NextResponse.json({ 
      success: true, 
      message: `Métricas de ${dados.items?.length || 0} músicas sincronizadas instantaneamente!` 
    });

  } catch (error: any) {
    if (conexao) await conexao.end();
    return NextResponse.json({ success: false, error: error?.message || "Erro no processamento do lote" }, { status: 500 });
  }
}
