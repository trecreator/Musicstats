import type { MetadataRoute } from "next";
import { buscarTodosIdsVideos } from "./actions/searchMusic";

// Gera o sitemap a cada requisição: músicas novas aparecem na hora,
// sem depender de um novo deploy (antes ele ficava congelado no build).
export const dynamic = "force-dynamic";

const SITE = "https://musicalstats.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await buscarTodosIdsVideos();

  const videoUrls: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${SITE}/video/${video.id_video}`,
    lastModified: video.ultima_atualizacao || new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const paginasFixas = ["/TodayMostViewedList", "/about", "/aboutYoutube", "/contact"];

  return [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...paginasFixas.map((p) => ({
      url: `${SITE}${p}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...videoUrls,
  ];
}
