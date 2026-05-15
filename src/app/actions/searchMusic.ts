'use server';

import mysql from "mysql2/promise";
import type { MusicaRow } from "@/types/music";
import type { Musica } from "@/types/music";
import type { MusicaHistoricoRow } from "@/types/musicHistorico";
import type { MusicaHistorico } from "@/types/musicHistorico";

// Remova o "export" da linha abaixo. Deixe apenas "const conexao"
const poolConfig = { uri: process.env.DATABASE_URL };

const globalForMysql = globalThis as unknown as {
  conexao: mysql.Pool | undefined;
};

// Aqui tiramos o export:
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
  // Força que o limite e o início sejam tratados estritamente como números inteiros
  const limiteInt = Math.floor(Number(limite));
  const inicioInt = Math.floor((Number(pagina) - 1) * limiteInt);
  
  const parametros: any[] = [];
  let sql = `SELECT * FROM musicas WHERE 1=1`;

  // 2. Filtro condicional baseado na digitação do usuário
  if (busca.trim()) {
    sql += ` AND titulo LIKE ? AND views != 0`; 
    parametros.push(`%${busca}%`);
  }

  // 3. Sistema de Ordenação
  let orderByClause = "ORDER BY views DESC";
  if (ordenacao === "views_asc") orderByClause = "ORDER BY views ASC";
  if (ordenacao === "idade_desc") orderByClause = "ORDER BY published_at DESC";
  if (ordenacao === "idade_asc") orderByClause = "ORDER BY published_at ASC";
  
  sql += ` ${orderByClause}`;

  // 4. Injeção de paginação forçando inteiros
  sql += ` LIMIT ? OFFSET ?`;
  parametros.push(limiteInt, inicioInt);

  // Executa enviando os parâmetros limpos
  const [rows] = await conexao.query<any[]>(sql, parametros);
  return rows;
}


// --- SUAS OUTRAS FUNÇÕES AUXILIARES CONTINUAM IGUAIS ---
export async function buscarMusicaPorId(id_video: string): Promise<Musica | null> {
  const [rows] = await conexao.query<MusicaRow[]>(
    `SELECT id_video, titulo, url_video, views, likes, comentarios, published_at, thumbnail, ultima_atualizacao, visits FROM musicas WHERE id_video = ? LIMIT 1`,
    [id_video]
  );
  return rows[0] ?? null; 
}

export async function buscarTags(id_video: string) {
  const [rows] = await conexao.query<any[]>(
    `SELECT tags.id, tags.nome, tags.color FROM musicas JOIN musicas_tags ON musicas_tags.musica_id = musicas.id JOIN tags ON tags.id = musicas_tags.tag_id WHERE musicas.id_video = ?;`,
    [id_video]
  );
  return rows;
}

export async function buscarHistorioMusica(id_video: string): Promise<MusicaHistorico | null> {
  const [rows] = await conexao.query<MusicaHistoricoRow[]>(
    `SELECT id_video, views, likes, comentarios, capturado_em FROM musicas_historico WHERE id_video = ? LIMIT 1;`,
    [id_video]
  );
  return rows[0] ?? null;
}

// Adicione no final de src/app/actions/searchMusic.ts

export async function registrarVisitaMusica(id_video: string, ip: string): Promise<void> {
  if (!id_video || !ip) return;

  // 1. Verifica se já existe um acesso desse IP para esse vídeo na data de HOJE
  const [rows] = await conexao.query<any[]>(
    `SELECT id FROM musicas_visitas_log 
     WHERE id_video = ? AND ip_usuario = ? AND data_acesso = CURDATE() 
     LIMIT 1`,
    [id_video, ip]
  );

  // 2. Se o banco encontrou uma linha, significa que o IP já acessou hoje. Paramos aqui.
  if (rows.length > 0) return;

  // 3. Caso contrário, registra o IP no log diário para travar novos cliques hoje
  await conexao.query(
    `INSERT INTO musicas_visitas_log (id_video, ip_usuario, data_acesso) VALUES (?, ?, CURDATE())`,
    [id_video, ip]
  );

  // 4. Incrementa o contador oficial de 'visits' na tabela de músicas
  await conexao.query(
    `UPDATE musicas SET visits = visits + 1 WHERE id_video = ?`,
    [id_video]
  );
}
