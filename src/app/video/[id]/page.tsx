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

// FUNÇÃO AUXILIAR CORRIGIDA: Adicionado o $ e a rota /embed/
function formatarLinkEmbed(url: string): string {
  if (!url) return "";
  
  // Caso 1: Link padrão de computador (https://youtube.com)
  if (url.includes("watch?v=")) {
    const partes = url.split("watch?v=");
    if (partes[1]) {
      const idLimpo = partes[1].split("&")[0]; // Remove parâmetros extras como &ab_channel
      return `https://www.youtube.com/embed/${idLimpo}`; // Adicionado a barra e o $
    }
  }
  
  // Caso 2: Link encurtado de celular (https://youtu.be)
  if (url.includes("youtu.be/")) {
    const partes = url.split("youtu.be/");
    if (partes[1]) {
      const idLimpo = partes[1].split("?")[0]; // Remove parâmetros de compartilhamento
      return `https://www.youtube.com/embed/${idLimpo}`; // Adicionado a barra e o $
    }
  }
  
  return url;
}


export default async function VideoPage({ params }: VideoPageProps) {
  // 1. Aguarda e captura o ID vindo da URL
  const { id } = await params;

  // 2. Busca os dados no MySQL
  const musica = await buscarMusicaPorId(id);
  const historico: MusicaHistorico | null = await buscarHistorioMusica(id);
  
  // 3. Primeira Salvaguarda: Garante que a música existe
  if (!musica) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Music not found in our database.</h1>
      </main>
    );
  }

  // 4. Segunda Salvaguarda: Garante que o histórico existe
  if (!historico) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Historical data not found for this music.</h1>
      </main>
    );
  }

  // A partir daqui o TypeScript garante que nem 'musica' nem 'historico' são nulos!   
  const yesterdayViews = await calcularYesterdayViews(id);
  const ViewsSuavizadas = SuavizarNumero(musica.views);
  const yesterdayViewsSuavizadas = SuavizarNumero(yesterdayViews);
  const yesterdayComments = musica.comentarios - historico.comentarios;
  const likes = SuavizarNumero(musica.likes);
  const likesYesterday = musica.likes - historico.likes;
  const likesState = likesYesterday >= 0 ? "+" : "-";
  
  // Converte a URL do banco para o link embed correto do iframe
  const urlEmbedFinal = formatarLinkEmbed(musica.url_video || "");

  if (!musica.url_video) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Cannot find music url.</h1>
      </main>
    );
  }

  return (
    <main className="pt-[120px] min-h-screen bg-purple-900/10 text-white p-6 font-mono">
      
      {/* Título da música centralizado */}
      <h2 className="text-center text-xl text-white mb-2 font-bold uppercase tracking-wider">
        {musica.titulo}
      </h2>

      <h4 className="text-center text-sm text-white/70 mb-8">
        Watch on youtube:{" "}
        <Link href={musica.url_video} target="_blank" className="text-blue-400 hover:underline">
           {musica.url_video}
        </Link>
      </h4>

      {/* Container Principal */}
      <div className="flex mt-10 justify-start ml-[100px] mb-6">
        
        {/* Box do Player de Vídeo Iframe */}
        <div className="rounded border border-white/20 hover:border-blue-500/50 transition-all duration-300">
          <iframe
            width={1280}  // Largura proporcional (600px)
            height={720} // Altura proporcional (337.5px)
            src={urlEmbedFinal} // Passa a string convertida diretamente aqui
            title={`Reproduzir ${musica.titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informações na Direita */}
        <div className="mt-4 mb-4 border-2 border-purple-900/0 bg-purple-900/10 rounded w-[800px] backdrop-blur-sm p-4 space-y-4 ml-6">
          <div>
            <h1 className="text-lg text-white/90">
              ID: <span className="text-sm text-red-700 ">{musica.id_video}</span>
            </h1>

            <h1 className="text-lg text-white/90">
              Total views: <span className="text-sm text-blue-400 ">{ViewsSuavizadas}</span>
            </h1>

            <h1 className="text-lg text-white/90">
              Views Yesterday: <span className="mb-[4px] text-sm text-blue-300 ">+{yesterdayViewsSuavizadas}</span>
            </h1>

            <h1 className="text-lg text-white/90">
              Comments: <span className="mb-[4px] text-sm text-purple-400 ">{musica.comentarios?.toLocaleString() ?? 0}</span>
            </h1>

            <h1 className="text-lg text-white/90">
              New comments yesterday: <span className="mb-[4px] text-sm text-purple-300 ">+{yesterdayComments}</span>
            </h1>

            <h1 className="text-lg text-white/90">
              Likes: <span className="mb-[4px] text-sm text-orange-300 ">{likes}</span>
            </h1>

            <h1 className="text-lg text-white/90">
              New likes yesterday: <span className="mb-[4px] text-sm text-orange-300 ">{likesState}{Math.abs(likesYesterday)}</span>
            </h1>
          </div>
        </div>

      </div>

      <h5 className="text-center text-sm text-white/60 mt-8">
        page visits: {musica.visits} | <Link href="/" className="text-blue-400 hover:underline"> back to homepage</Link>
      </h5>

    </main>
  );
}
