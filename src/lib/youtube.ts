import 'dotenv/config';

import { google } from 'googleapis';

const youtube = google.youtube('v3');

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string | null;
  thumbnail: string;
}

export async function obterDadosVideos(
  videoIds: string[]
): Promise<YouTubeVideoData[]> {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error(
        'YOUTUBE_API_KEY não encontrada'
      );
    }

    const response =
      await youtube.videos.list({
        key: process.env.YOUTUBE_API_KEY,

        part: [
          'snippet',
          'statistics',
        ],

        id: videoIds,
      });

    const items =
      response.data.items || [];

    return items.map((video) => ({
      videoId: video.id || '',

      title:
        video.snippet?.title ||
        'Sem título',

      views: Number(
        video.statistics?.viewCount || 0
      ),

      likes: Number(
        video.statistics?.likeCount || 0
      ),

      comments: Number(
        video.statistics?.commentCount || 0
      ),

      publishedAt:
        video.snippet?.publishedAt ||
        null,

      thumbnail:
        video.snippet?.thumbnails?.high
          ?.url || '',
    }));
  } catch (error) {
    console.error(
      'Erro na API do YouTube:',
      error
    );

    return [];
  }
}