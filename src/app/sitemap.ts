import { MetadataRoute } from 'next';
import { buscarTodosIdsVideos } from './actions/searchMusic';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const videos = await buscarTodosIdsVideos();

  const videoUrls: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `https://musicalstats.com/video/${video.id_video}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://musicalstats.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },

    ...videoUrls,
  ];
}