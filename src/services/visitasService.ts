import { createHmac } from "crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { conexao } from "@/lib/db";

// Fica fora de actions/searchMusic.ts de propósito: tudo que é exportado de um arquivo
// 'use server' pode ser chamado direto pelo navegador, o que pularia os filtros da API.

// O IP nunca é salvo. O hash muda a cada dia, então só serve para evitar contagem repetida
// no mesmo dia e não permite seguir um visitante ao longo do tempo.
function anonimizarIp(ip: string, data: string, segredo: string) {
  return createHmac("sha256", segredo).update(`visita:${data}:${ip}`).digest("hex");
}

// Retorna true quando uma visita nova foi contada.
export async function registrarVisitaMusica(id_video: string, ip: string): Promise<boolean> {
  const segredo = process.env.CRON_SECRET?.trim();
  if (!segredo) return false;

  const data = new Date().toISOString().slice(0, 10); // dia em UTC
  const ipAnonimo = anonimizarIp(ip, data, segredo);

  const connection = await conexao.getConnection();
  try {
    const [musicas] = await connection.query<RowDataPacket[]>(
      `SELECT 1 FROM musicas WHERE id_video = ? LIMIT 1`,
      [id_video]
    );
    if (musicas.length === 0) return false;

    const [existentes] = await connection.query<RowDataPacket[]>(
      `SELECT 1 FROM musicas_visitas_log
       WHERE id_video = ? AND ip_usuario = ? AND data_acesso = ?
       LIMIT 1`,
      [id_video, ipAnonimo, data]
    );
    if (existentes.length > 0) return false;

    await connection.beginTransaction();
    try {
      // Com o índice único, duas chamadas simultâneas não geram registro duplicado.
      const [resultado] = await connection.query<ResultSetHeader>(
        `INSERT IGNORE INTO musicas_visitas_log (id_video, ip_usuario, data_acesso) VALUES (?, ?, ?)`,
        [id_video, ipAnonimo, data]
      );

      if (resultado.affectedRows !== 1) {
        await connection.rollback();
        return false;
      }

      // A coluna ultima_atualizacao tem ON UPDATE CURRENT_TIMESTAMP: sem repetir o valor aqui,
      // cada visita mudaria a data de atualização da música (usada no site e no sitemap).
      await connection.query(
        `UPDATE musicas SET visits = visits + 1, ultima_atualizacao = ultima_atualizacao WHERE id_video = ?`,
        [id_video]
      );
      await connection.commit();
      return true;
    } catch (erro) {
      await connection.rollback();
      throw erro;
    }
  } finally {
    connection.release();
  }
}
