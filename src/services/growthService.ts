import { buscarHistorioMusica, buscarMusicaPorId } from "@/app/actions/searchMusic";

export async function calcularYesterdayViews(id_video: string)
{

    const musica = await buscarMusicaPorId(id_video);
    const musicaHistorico = await buscarHistorioMusica(id_video);
    
    if(!musica || !musicaHistorico){return 0;}

    let yesterdayViews: number =  (musicaHistorico.views - musica.views)

    
}