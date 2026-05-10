"use server";

import { pool } from "@/lib/db";
import { buscarMusicasMonitoradas } from "@/services/musicService";


export async function getAllMusic() {
  const [rows] = await pool.query<any[]>(`
    SELECT * FROM musicas
  `);
  return rows;
}



export async function getMusicById(id_video: string) {
  const [rows]: any = await pool.query(
    `
    SELECT *
    FROM musicas
    WHERE id_video = ?
    LIMIT 1
    `,
    [id_video]
  );

  return rows?.[0] || null;
}

export async function getHomeData() {
  return await buscarMusicasMonitoradas();
}