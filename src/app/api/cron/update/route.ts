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

  // Remove qualquer espaço em branco acidental que possa ter vindo do painel da Vercel
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY ausente." }, { status: 500 });
  }

  const conexao = await mysql.createConnection(poolConfig);

  try {
    // 1. Busca os IDs garantindo que não pegará registros nulos ou em branco
    const [musicas] = await conexao.query<any[]>(
      "SELECT id_video FROM musicas WHERE id_video IS NOT NULL AND id_video != ''"
    );
    
    if (musicas.length === 0) {
      await conexao.end();
      return NextResponse.json({ success: true, message: "Nenhuma música válida para atualizar." });
    }

    // 2. Cria a lista limpando espaços vazios acidentais dos lados de cada ID
    const listaIds = musicas.map(m => m.id_video.trim()).join(",");

    // 3. Monta a URL oficial da API v3 do YouTube
    const urlYoutube = `https://googleapis.com{listaIds}&key=${apiKey}`;
    
    // 4. Configura headers básicos de agente de navegação para evitar bloqueios da Vercel
    const resposta = await fetch(urlYoutube, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      },
      next: { revalidate: 0 } // Desativa o cache interno do Next.js
    });
    
    if (!resposta.ok) {
      const textoErro = await resposta.text();
      throw new Error(`Google API respondeu com erro ${resposta.status}: ${textoErro}`);
    }
    
    const dados = await resposta.json();

    if (!dados.items || dados.items.length === 0) {
      await conexao.end();
      return NextResponse.json({ success: false, error: "Nenhum dado retornado do YouTube. Verifique os IDs." });
    }

    // 5. Salva os dados no banco
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

    await conexao.end();
    return NextResponse.json({ 
      success: true, 
      message: `Métricas de ${dados.items.length} músicas sincronizadas com sucesso!` 
    });

  } catch (error: any) {
    if (conexao) await conexao.end();
    return NextResponse.json({ 
      success: false, 
      error: error?.message || "Erro desconhecido na execução do fetch" 
    }, { status: 500 });
  }
}
