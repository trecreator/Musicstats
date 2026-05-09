import dotenv from 'dotenv';

dotenv.config({
  path: '.env.local',
});

console.log(
  process.env.YOUTUBE_API_KEY
);

import { pool } from '@/lib/db';

import {
  obterDadosVideos,
} from '@/lib/youtube';

export async function atualizarYoutube() {
  try {
    console.log(
      'Iniciando updater...'
    );

    /*
      BUSCA TODOS OS IDs
    */

    const [rows]: any =
      await pool.query(`
        SELECT id_video
        FROM musicas
      `);

    if (!rows.length) {
      console.log(
        'Nenhuma música encontrada.'
      );

      return;
    }

    /*
      ARRAY IDS
    */

    const videoIds = rows.map(
      (m: any) => m.id_video
    );

    console.log(
      `Atualizando ${videoIds.length} vídeos...`
    );

    /*
      UMA REQUEST
    */

    const videos =
      await obterDadosVideos(
        videoIds
      );

    console.log(
      `${videos.length} vídeos recebidos da API`
    );

    /*
      LOOP UPDATE
    */

    for (const video of videos) {

      /*
        UPDATE TABELA PRINCIPAL
      */

      await pool.query(
        `
        UPDATE musicas
        SET
          titulo = ?,
          views = ?,
          likes = ?,
          comentarios = ?,
          published_at = ?,
          thumbnail = ?,
          ultima_atualizacao = NOW()
        WHERE id_video = ?
        `,
        [
          video.title,
          video.views,
          video.likes,
          video.comments,
          video.publishedAt,
          video.thumbnail,
          video.videoId,
        ]
      );

      

      /*
        SNAPSHOT HISTÓRICO
      */

      await pool.query(
        `
        INSERT INTO musicas_historico
        (
          id_video,
          views,
          likes,
          comentarios
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          video.videoId,
          video.views,
          video.likes,
          video.comments,
        ]
      );
    }

    console.log(
      'Updater finalizado.'
    );

  } catch (error) {
    console.error(error);
  } finally {
  console.log('Updater finalizado.');
}
}

