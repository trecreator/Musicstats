import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Força a rota a não usar cache para sempre trazer dados novos
export const dynamic = 'force-dynamic';

// Configuração Adaptativa do Banco de Dados idêntica ao seu searchMusic
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
  // 1. Captura o token passado no link do navegador (?token=xxx)
  const { searchParams } = new URL(request.url);
  const tokenUrl = searchParams.get("token");
  
  // 2. TOKEN DE SEGURANÇA SEGURO: Altere o "SUA_SENHA_AQUI" para o mesmo token que você escreveu no seu vercel.json
  const tokenSecreto = process.env.CRON_SECRET || "SUA_SENHA_AQUI";

  if (!tokenUrl || tokenUrl !== tokenSecreto) {
    return NextResponse.json({ error: "Acesso não autorizado. Token inválido." }, { status: 401 });
  }

  if (!poolConfig) {
    return NextResponse.json({ error: "Banco de dados não configurado para o ambiente do Cron." }, { status: 500 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY ausente nas variáveis de ambiente." }, { status: 500 });
  }

  const conexao = await mysql.createConnection(poolConfig);

  try {
    // 3. Busca a lista de IDs de vídeos salvos na sua tabela
    const [musicas] = await conexao.query<any[]>("SELECT id_video FROM musicas");

    // 4. Varre cada música, consulta a API do Google e atualiza o MySQL
    for (const musica of musicas) {
      const urlYoutube = `https://googleapis.com{musica.id_video}&key=${apiKey}`;
      
      const resposta = await fetch(urlYoutube);
      const dados = await resposta.json();

      if (dados.items && dados.items.length > 0) {
        const stats = dados.items.statistics;
        const views = Number(stats.viewCount || 0);
        const likes = Number(stats.likeCount || 0);
        const comentarios = Number(stats.commentCount || 0);

        // Salva os números fresquinhos na tabela do Railway
        await conexao.query(
          `UPDATE musicas SET views = ?, likes = ?, comentarios = ?, ultima_atualizacao = NOW() WHERE id_video = ?`,
          [views, likes, comentarios, musica.id_video]
        );
      }
    }

    await conexao.end();
    return NextResponse.json({ 
      success: true, 
      message: `Métricas de ${musicas.length} músicas atualizadas com sucesso no Railway!` 
    });

  } catch (error: any) {
    if (conexao) await conexao.end();
    return NextResponse.json({ success: false, error: error?.message || "Erro interno no Cron" }, { status: 500 });
  }
}
