export const dynamic = 'force-dynamic';

import Image from "next/image";
import { buscarHistorioMusica, buscarMusicaPorId } from "@/app/actions/searchMusic";
import { SuavizarNumero } from "@/utils/math";
import { calcularYesterdayViews } from "@/services/growthService";
import { MusicaHistorico } from "@/types/musicHistorico";
import Link from "next/link";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  const musica = await buscarMusicaPorId(id);
  const historico: MusicaHistorico | null = await buscarHistorioMusica(id);
  
  if (!musica) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Music not found in our database.</h1>
      </main>
    );
  }

  if (!historico) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Historical data not found for this music.</h1>
      </main>
    );
  }

  const yesterdayViews = await calcularYesterdayViews(id);
  const ViewsSuavizadas = SuavizarNumero(musica.views);
  const yesterdayViewsSuavizadas = SuavizarNumero(yesterdayViews);
  const yesterdayComments = musica.comentarios - historico.comentarios;
  const likes = SuavizarNumero(musica.likes);
  const likesYesterday = musica.likes - historico.likes;
  const likesState = likesYesterday >= 0 ? "+" : "-";
  const idLimpo = musica.id_video;
  
  const urlEmbedFinal = formatarLinkEmbed(musica.url_video || "", idLimpo);

  if (!musica.url_video) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Cannot find music url.</h1>
      </main>
    );
  }

  return (
    <main className="pt-[120px] min-h-screen bg-purple-900/5 text-white p-6 font-mono">
      
      {/* Título da música centralizado */}
      <h2 className="text-center text-2xl text-white mb-2 font-bold uppercase tracking-wider max-w-3xl mx-auto">
        {musica.titulo}
      </h2>

      <h4 className="text-center text-sm text-white/60 mb-8">
        Watch on YouTube:{" "}
        <Link href={musica.url_video} target="_blank" className="text-purple-400 hover:text-purple-300 hover:underline transition-colors">
           {musica.url_video}
        </Link>
      </h4>

      {/* Conteúdo Centralizado (Coluna: Vídeo em cima, dados embaixo) */}
      <div className="flex flex-col items-center max-w-4xl mx-auto gap-8 mb-16">
        
        {/* Box do Player de Vídeo Iframe (Centralizado com proporção exata) */}
        <div className="w-[600px] h-[337.5px] overflow-hidden rounded border border-white/15 bg-black shadow-2xl shadow-purple-950/20">
          <iframe
            width={600}
            height={337.5}
            src={urlEmbedFinal}
            title={`Reproduzir ${musica.titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informações Abaixo do Vídeo (Estilo Painel Kworb Limpo) */}
        <div className="w-[600px] border border-white/10 bg-white/5 rounded backdrop-blur-md p-6 font-mono">
          
          <div className="text-xs uppercase font-bold tracking-widest text-white/30 border-b border-white/5 pb-2 mb-4">
            Statistical Analytics
          </div>

          <div className="space-y-3">
            
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Video ID</span>
              <span className="text-red-400 font-semibold">{musica.id_video}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Total Views</span>
              <span className="text-blue-400 font-bold text-base">{ViewsSuavizadas}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Views Yesterday</span>
              <span className="text-blue-300 font-semibold">+{yesterdayViewsSuavizadas}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Total Likes</span>
              <span className="text-orange-400 font-semibold">{likes}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">New Likes Yesterday</span>
              <span className="text-orange-300 font-semibold">{likesState}{Math.abs(likesYesterday)}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Total Comments</span>
              <span className="text-purple-400 font-semibold">{musica.comentarios?.toLocaleString() ?? 0}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">New Comments Yesterday</span>
              <span className="text-purple-300 font-semibold">+{yesterdayComments}</span>
            </div>

          </div>
        </div>

      </div>

      {/* Rodapé de Navegação */}
      <h5 className="text-center text-xs text-white/40 border-t border-white/5 pt-6 max-w-xl mx-auto">
        Page Visits: {musica.visits} &nbsp;|&nbsp; 
        <Link href="/" className="text-purple-400 hover:text-purple-300 hover:underline ml-1 font-bold">
           Back to Homepage
        </Link>
      </h5>

    </main>
  );
}

function formatarLinkEmbed(url: string, id: string): string {
  if (!url) return "";
  if (url.includes("watch?v=")) {
    const partes = url.split("watch?v=");
    if (partes[1]) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }
  if (url.includes("youtu.be/")) {
    const partes = url.split("youtu.be/");
    if (partes[1]) {
      return `https://www.youtube.com/embed/${id}`;
    }
  }
  return url;
}
