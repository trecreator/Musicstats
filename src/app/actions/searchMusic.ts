'use server';

import mysql from "mysql2/promise";
import type { MusicaRow } from "@/types/music";
import type { Musica } from "@/types/music";
import type { MusicaHistoricoRow } from "@/types/musicHistorico";
import type { MusicaHistorico } from "@/types/musicHistorico";

// LÓGICA INTELIGENTE COM SSL ADICIONADO:
const poolConfig = process.env.DATABASE_URL
  ? { uri: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // ADICIONE ESTA LINHA ABAIXO:
      ssl: { rejectUnauthorized: false } 
    };


const globalForMysql = globalThis as unknown as {
  conexao: mysql.Pool | undefined;
};

// Instancia o Pool único de conexões reutilizáveis
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
  const limiteInt = Math.floor(Number(limite));
  const inicioInt = Math.floor((Number(pagina) - 1) * limiteInt);
  
  const parametros: any[] = [];
  let sql = `SELECT * FROM musicas WHERE 1=1`;

  if (busca.trim()) {
    sql += ` AND titulo LIKE ? AND views != 0`; 
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
    `SELECT id_video, titulo, url_video, views, likes, comentarios, published_at, thumbnail, ultima_atualizacao, visits FROM musicas WHERE id_video = ? LIMIT 1`,
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

// --- AJUSTADO: Retorna explicitamente a primeira linha do array ou null se estiver vazio ---
export async function buscarHistorioMusica(id_video: string): Promise<MusicaHistorico | null> {
  const [rows] = await conexao.query<MusicaHistoricoRow[]>(
    `SELECT id_video, views, likes, comentarios, capturado_em FROM musicas_historico WHERE id_video = ? LIMIT 1;`,
    [id_video]
  );
  if (!rows || rows.length === 0) return null;
  return rows[0];
}

export async function registrarVisitaMusica(id_video: string, ip: string): Promise<void> {
  if (!id_video || !ip) return;

  const [rows] = await conexao.query<any[]>(
    `SELECT id FROM musicas_visitas_log 
     WHERE id_video = ? AND ip_usuario = ? AND data_acesso = CURDATE() 
     LIMIT 1`,
    [id_video, ip]
  );

  if (rows.length > 0) return;

  await conexao.query(
    `INSERT INTO musicas_visitas_log (id_video, ip_usuario, data_acesso) VALUES (?, ?, CURDATE())`,
    [id_video, ip]
  );

  await conexao.query(
    `UPDATE musicas SET visits = visits + 1 WHERE id_video = ?`,
    [id_video]
  );
}
