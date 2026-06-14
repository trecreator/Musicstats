'use server';

import mysql from "mysql2/promise";
import type { MusicaRow } from "@/types/music";
import type { Musica } from "@/types/music";
import type { MusicaHistoricoRow } from "@/types/musicHistorico";
import type { MusicaHistorico } from "@/types/musicHistorico";

// 1. CHECAGEM DE SEGURANÇA: Se não houver dados, cria um objeto vazio seguro para o Next.js não travar o build
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
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: { rejectUnauthorized: false }
      }
    : { host: "127.0.0.1" }; // Fallback inofensivo apenas para passar pelo robô de build da Vercel

const globalForMysql = globalThis as unknown as {
  conexao: mysql.Pool | undefined;
};

const conexao = globalForMysql.conexao ?? mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForMysql.conexao = conexao;
}

// --- FUNÇÃO CENTRAL QUE CONECTA BUSCA, PAGINAÇÃO E ORDENAÇÃO ---
export async function buscarMusicasAvancado(
  busca: string = "",
  pagina: number = 1,
  limite: number = 25,
  ordenacao: string = "views_desc"
) {
  const limiteInt = Math.min(Math.max(Math.floor(Number(limite)), 1), 100);
  const paginaInt = Math.max(Math.floor(Number(pagina)), 1);
  const inicioInt = (paginaInt - 1) * limiteInt;
  
  const parametros: any[] = [];
  let sql = `SELECT 
  id_video,
  titulo,
  url_video,
  views,
  likes,
  comentarios,
  published_at,
  thumbnail,
  ultima_atualizacao,
  visits
  FROM musicas WHERE views > 0`;

  if (busca.trim()) {
    sql += ` AND titulo LIKE ?`; 
    parametros.push(`%${busca}%`);
  }

  let orderByClause = "ORDER BY views DESC";
  if (ordenacao === "views_asc") orderByClause = "ORDER BY views ASC";
  if (ordenacao === "idade_desc") orderByClause = "ORDER BY published_at DESC";
  if (ordenacao === "idade_asc") orderByClause = "ORDER BY published_at ASC";
  
  sql += ` ${orderByClause}`;
  sql += ` LIMIT ? OFFSET ?`;
  parametros.push(limiteInt, inicioInt);

  const [rows] = await conexao.query<any[]>(sql, parametros);
  return rows;
}

// --- AJUSTADO: Retorna explicitamente a primeira linha do array ou null se estiver vazio ---
export async function buscarMusicaPorId(id_video: string): Promise<Musica | null> {
  const [rows] = await conexao.query<MusicaRow[]>(
    `SELECT id_video, titulo, url_video, views, likes, comentarios, published_at, thumbnail, ultima_atualizacao, visits, duration FROM musicas WHERE id_video = ? LIMIT 1`,
    [id_video]
  );
  if (!rows || rows.length === 0) return null;
  return rows[0]; 
}


export async function buscarTags(id_video: string) {
  const [rows] = await conexao.query<any[]>(
    `SELECT tags.id, tags.nome, tags.color FROM musicas JOIN musicas_tags ON musicas_tags.musica_id = musicas.id JOIN tags ON tags.id = musicas_tags.tag_id WHERE musicas.id_video = ?;`,
    [id_video]
  );
  return rows;
}

export async function buscarHistoricoMusica(id_video: string): Promise<MusicaHistorico | null> {
  const [rows] = await conexao.query<MusicaHistoricoRow[]>(
    `
    SELECT id_video, views, likes, comentarios, capturado_em
    FROM musicas_historico
    WHERE id_video = ?
    ORDER BY capturado_em DESC
    LIMIT 1;
    `,
    [id_video]
  );

  if (!rows || rows.length === 0) return null;

  return rows[0];
}

export async function registrarVisitaMusica(id_video: string, ip: string): Promise<void> {
  if (!id_video || !ip) return;

  const [rows] = await conexao.query<any[]>(
    `SELECT id FROM musicas_visitas_log 
     WHERE id_video = ? AND ip_usuario = ? AND data_acesso = UTC_DATE() 
     LIMIT 1`,
    [id_video, ip]
  );

  if (rows.length > 0) return;

  await conexao.query(
    `INSERT INTO musicas_visitas_log (id_video, ip_usuario, data_acesso) VALUES (?, ?, UTC_DATE())`,
    [id_video, ip]
  );

  await conexao.query(
    `UPDATE musicas SET visits = visits + 1 WHERE id_video = ?`,
    [id_video]
  );
}

export async function listarHistoricoCompleto(id_video: string): Promise<any[]> {
  const [rows] = await conexao.query<any[]>(
    `SELECT views, likes, comentarios, capturado_em 
     FROM musicas_historico 
     WHERE id_video = ? 
     ORDER BY capturado_em DESC;`,
    [id_video]
  );
  return rows;
}

export async function buscarPrimeiroRegistroDoMes(id_video: string): Promise<any | null> {
  const [rows] = await conexao.query<any[]>(
    `
    SELECT views, capturado_em
    FROM musicas_historico
    WHERE id_video = ?
      AND capturado_em >= DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-01')
      AND capturado_em < DATE_FORMAT(UTC_TIMESTAMP() + INTERVAL 1 MONTH, '%Y-%m-01')
    ORDER BY capturado_em ASC
    LIMIT 1;
    `,
    [id_video]
  );

  if (!rows || rows.length === 0) return null;

  return rows[0];
}

export async function buscarHistoricoOntem(
  id_video: string
): Promise<any | null> {

  const [rows] = await conexao.query<any[]>(
    `
    SELECT views, likes, comentarios, capturado_em
    FROM (
        SELECT
            views,
            likes,
            comentarios,
            capturado_em,
            ROW_NUMBER() OVER (
                ORDER BY capturado_em DESC
            ) AS rn
        FROM musicas_historico
        WHERE id_video = ?
    ) ranked
    WHERE rn = 2;
    `,
    [id_video]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

export async function buscarGanhosOntemLote(
  ids_video: string[]
): Promise<Record<string, number>> {

  if (ids_video.length === 0) return {};

  const placeholders = ids_video.map(() => "?").join(",");

  const [rows] = await conexao.query<any[]>(
    `
    SELECT h.id_video, h.views
    FROM musicas_historico h
    INNER JOIN (
        SELECT 
            id_video,
            MAX(capturado_em) AS capturado_em
        FROM (
            SELECT
                id_video,
                capturado_em,
                ROW_NUMBER() OVER (
                    PARTITION BY id_video
                    ORDER BY capturado_em DESC
                ) AS rn
            FROM musicas_historico
            WHERE id_video IN (${placeholders})
        ) ranked
        WHERE rn = 2
        GROUP BY id_video
    ) ultimos
      ON h.id_video = ultimos.id_video
     AND h.capturado_em = ultimos.capturado_em;
    `,
    ids_video
  );

  const mapa: Record<string, number> = {};

  rows.forEach((row) => {
    mapa[row.id_video] = row.views;
  });

  return mapa;
}

export async function buscarUltimaAtualizacao(): Promise<string | null> {
  const [rows] = await conexao.query<any[]>(
    `
    SELECT MAX(ultima_atualizacao) as ultima_atualizacao
    FROM musicas;
    `
  );

  if (!rows || rows.length === 0 || !rows[0].ultima_atualizacao) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(rows[0].ultima_atualizacao));
}

export async function buscarTodosIdsVideos(): Promise<
  {
    id_video: string;
    ultima_atualizacao: Date | null;
  }[]
> {
  const [rows] = await conexao.query<any[]>(
    `
    SELECT
      id_video,
      ultima_atualizacao
    FROM musicas
    WHERE views > 0
    `
  );

  return rows as {
    id_video: string;
    ultima_atualizacao: Date | null;
  }[];
}

export async function buscarMaisVistasHoje(): Promise<any[]> {
  const [rows] = await conexao.query<any[]>(
    `SELECT 
        m.id_video, 
        m.titulo, 
        -- Subtrai as views atuais das views do segundo registro mais recente (rn = 2)
        (CAST(m.views AS SIGNED) - COALESCE(CAST(h.views AS SIGNED), CAST(m.views AS SIGNED))) AS yesterdayViews
     FROM musicas m
     LEFT JOIN (
        -- Seleciona exatamente o segundo registro mais recente de cada vídeo no histórico
        SELECT id_video, views
        FROM (
            SELECT 
                id_video, 
                views,
                ROW_NUMBER() OVER (
                    PARTITION BY id_video 
                    ORDER BY capturado_em DESC
                ) AS rn
            FROM musicas_historico
        ) ranked
        WHERE rn = 2
     ) h ON m.id_video = h.id_video
     ORDER BY yesterdayViews DESC`
  );
  return rows;
}
