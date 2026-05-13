'use server';

import mysql from "mysql2/promise";
import type { MusicaRow } from "@/types/music";
import type { Musica } from "@/types/music";
import type { MusicaHistoricoRow } from "@/types/musicHistorico";
import type { MusicaHistorico } from "@/types/musicHistorico";


const conexao = mysql.createPool({uri: process.env.DATABASE_URL}); //cria uma conexão reutilizável com o banco de dados

export async function buscarMusicaPorId(id_video: string): Promise<Musica | null> // função que pega os dados de uma música no banco de dados
{

  const [rows] = await conexao.query<MusicaRow[]>(
    `
    SELECT
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
      FROM musicas
      WHERE id_video = ?
      LIMIT 1
      `,
      [id_video]
  );
  //rows = lista de resultados do banco(array), [0] = primeira e única música encontrada.

return rows[0] ?? null; 
}

export async function buscarTodasAsMusicas(limite: number = 25, inicio: number = 0)
{

  const [rows] = await conexao.query<any[]> // Estabelece a conexão com o banco de dados
  (
    `
    SELECT * FROM musicas
    ORDER BY views DESC
    LIMIT ? OFFSET ? 
    `,
    [limite, inicio]
  );

  return rows;

}

export async function buscarTags(id_video: string)
{
  const [rows] = await conexao.query<any[]> // Estabelece a conexão com o banco de dados
  (

    `
    SELECT 
      tags.id,
      tags.nome,
      tags.color
    FROM musicas
    JOIN musicas_tags ON musicas_tags.musica_id = musicas.id
    JOIN tags ON tags.id = musicas_tags.tag_id
    WHERE musicas.id_video = ?;
    `,
    [id_video]
  );
  return rows;
}

export async function buscarHistorioMusica(id_video: string): Promise<MusicaHistorico | null>
{

  const [rows] = await conexao.query<MusicaHistoricoRow[]>(
  

    `
    SELECT
    id_video,
    views,
    likes,
    comentarios,
    capturado_em
    FROM musicas_historico
    WHERE id_videos = ?;
    LIMIT 1
    `,
    [id_video]
  )

  return rows[0] ?? null;


}

export async function FiltrarMusicaPorTitulo(busca: string) {
  // Se o usuário apagar o texto e a busca estiver vazia, 
  // evitamos fazer uma busca pesada com "%%" e retornamos uma lista vazia ou padrão
  if (!busca.trim()) return [];

  const [rows] = await conexao.query<any[]>(
    `
    SELECT * FROM musicas
    WHERE titulo LIKE ?
    ORDER BY views DESC
    LIMIT 25
    `,
    [`%${busca}%`] // O % antes e depois significa: "contém este texto"
  );

  return rows;
}