import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import https from "https";

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

// FUNÇÃO AUXILIAR: Executa a requisição usando HTTPS nativo para ignorar falhas do fetch do Node/Vercel
function fazerRequisicaoHttps(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let dados = "";
      res.on("data", (chunk) => { dados += chunk; });
      res.on("end", () => {
        try {
          resolve(JSON.parse(dados));
        } catch (e) {
          reject(new Error("Resposta do YouTube não é um JSON válido."));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

// FUNÇÃO AUXILIAR: Divide um array em pedaços menores (chunks)
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
  const tokenSecreto = process.env.CRON_SECRET || "ms_121920eCCLk2978_sec_page_r9";

  if (!tokenUrl || tokenUrl !== tokenSecreto) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  if (!poolConfig) {
    return NextResponse.json({ error: "Banco de dados não configurado." }, { status: 500 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY ausente." }, { status: 500 });
  }

  const conexao = await mysql.createConnection(poolConfig);
  let totalAtualizado = 0;

  try {
    // 1. Busca todos os IDs de músicas salvos no banco
    const [musicas] = await conexao.query<any[]>(
      "SELECT id_video FROM musicas WHERE id_video IS NOT NULL AND id_video != ''"
    );
    
    if (musicas.length === 0) {
      await conexao.end();
      return NextResponse.json({ success: true, message: "Nenhuma música para atualizar." });
    }

    // 2. Divide a lista completa de músicas em lotes de 50 em 50 (limite do YouTube)
    const lotesDeMusicas = dividirEmLotes(musicas, 50);

    // O loop 'for...of' garante que ele espere um lote terminar antes de ir para o próximo
    for (const lote of lotesDeMusicas) {
      const listaIds = lote.map(m => m.id_video.trim()).join(",");
      
      // LINHA CORRIGIDA: URL completa com o endpoint correto do YouTube e interpolação de string válida
      const urlYoutube = `https://googleapis.com{listaIds}&key=${apiKey}`;

      // 3. Executa a requisição deste lote específico
      const dados = await fazerRequisicaoHttps(urlYoutube);

      if (dados.error) {
        throw new Error(`Google API erro: ${dados.error.message || JSON.stringify(dados.error)}`);
      }

      if (!dados.items || dados.items.length === 0) {
        continue; // Se o lote atual falhar ou sumir do YouTube, pula e continua atualizando o resto
      }

      // 4. Salva os dados atualizados deste lote no Railway
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
        totalAtualizado++;
      }
    }

    await conexao.end();

    if (totalAtualizado === 0) {
      return NextResponse.json({ success: false, error: "Nenhum dado encontrado no YouTube para os IDs fornecidos." });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Métricas de ${totalAtualizado} músicas sincronizadas com sucesso usando HTTPS nativo!` 
    });

  } catch (error: any) {
    if (conexao) await conexao.end();
    return NextResponse.json({ 
      success: false, 
      error: error?.message || "Erro interno na execução do Cron" 
    }, { status: 500 });
  }
}
