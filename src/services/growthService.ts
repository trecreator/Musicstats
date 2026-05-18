import { buscarMusicaPorId, buscarHistoricoOntem } from "@/app/actions/searchMusic";

export async function calcularYesterdayViews(id_video: string): Promise<number> {
  const musica = await buscarMusicaPorId(id_video);
  const historicoOntem = await buscarHistoricoOntem(id_video);
    
  if (!musica || !historicoOntem) {
    return 0;
  }

  // Views atuais menos as views que o vídeo tinha ontem na mesma hora
  const yesterdayViews = musica.views - historicoOntem.views;

  // Garante que não retorne números negativos caso o YouTube retire views por auditoria
  return yesterdayViews > 0 ? yesterdayViews : 0;
}
