import { db } from "@/lib/db";

export async function getAllMusic() {
  const [rows] = await db.query<any[]>(`
    SELECT * FROM musicas
  `);
  return rows;
}



export async function getMusicById(id_video: string) {
  const [rows]: any = await db.query(
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