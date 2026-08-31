export const revalidate = 3600;

import Link from "next/link";
import { cache } from "react";
import { calcularPrevisaoViews } from "@/utils/predictions";
import type { Metadata } from "next";
import notfound from "./not-found";

import {
  buscarMusicaPorId,
  listarHistoricoPaginado,
  contarHistorico,
  buscarPrimeiroRegistroDoMes,
  buscarHistoricoOntem,
  buscarUltimos4Historicos
} from "@/app/actions/searchMusic";

import { SuavizarNumero } from "@/utils/math";
import VideoHistoricList from "@/app/_components/video/VideoHistoricList";
import VideoMonthViews from "@/app/_components/video/VideoMonthViews";
import ReachTimeCalculator from "./reachTimeCalculator";
import Charts from "./charts";

// Cache do React para evitar que a mesma query rode duas vezes (Metadata e Page)
const obterMusicaComCache = cache(async (id: string) => {
  return await buscarMusicaPorId(id);
});

/* ---------------- METADATA ---------------- */
export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { id } = await params;
  const musica = await obterMusicaComCache(id);

  if (!musica) return { title: "Music Not Found | MusicalStats" };

  return {
    title: `${musica.titulo} Youtube Statistics | MusicalStats`,
    description: ` ${musica.titulo} is currently with ${musica.likes} likes, ${musica.comentarios} comments and ${musica.views} views. `
  };
}

interface VideoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; }>;
}

/* ---------------- PAGE ---------------- */
export default async function VideoPage({ params, searchParams }: VideoPageProps) {
  const { id } = await params;
  const paginaAtual = Number((await searchParams).page) || 1;
  const registrosPorPagina = 12;

  /* 1. Dados base do vídeo */
  const musica = await obterMusicaComCache(id);

  if (!musica || !musica.url_video) {
    return (notfound())
  }

  /* 2. Queries paralelas */
  const [
    historicoOntem,
    historicoPaginaAtual,
    primeiroRegistroDoMes,
    totalHistorico,
  ] = await Promise.all([
    buscarHistoricoOntem(id),
    listarHistoricoPaginado(id, paginaAtual, registrosPorPagina),
    buscarPrimeiroRegistroDoMes(id),
    contarHistorico(id),
    
  ]);

  const totalPaginas = Math.ceil(totalHistorico / registrosPorPagina);

  const historicos = await buscarUltimos4Historicos(id)

  /* 3. Cálculos de Diferenças */
  const yesterdayViews = historicoOntem ? musica.views - historicoOntem.views : 0;
  const yesterdayLikes = historicoOntem ? musica.likes - historicoOntem.likes : 0;
  const yesterdayComments = historicoOntem ? musica.comentarios - historicoOntem.comentarios : 0;

  /* 4. Formatação e Otimização */
  const viewsSuavizadas = SuavizarNumero(musica.views);
  const likesSuavizados = SuavizarNumero(musica.likes);
  const commentsSuavizados = SuavizarNumero(musica.comentarios);
  const yesterdayViewsSuavizadas = SuavizarNumero(yesterdayViews);

  const publishedAtFormatado = musica.published_at
    ? new Date(musica.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  const urlEmbedFinal = formatarLinkEmbed(musica.url_video, musica.id_video);
  const previsaoViews = calcularPrevisaoViews(musica.views, historicoPaginaAtual);

 const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: musica.titulo,
  description: `${musica.titulo} statistics and historical evolution.`,
  embedUrl: urlEmbedFinal,
  thumbnailUrl: musica.thumbnail,
  uploadDate: musica.published_at
    ? new Date(musica.published_at).toISOString()
    : undefined,
  url: `https://musicalstats.com/video/${musica.id_video}`,
};

  

  return (
    <main className="pt-[120px] min-h-screen bg-purple-900/5 text-white p-6 font-mono">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* HEADER */}
      <h2 className="text-center text-2xl mb-2 font-bold uppercase tracking-wider max-w-3xl mx-auto">
        {musica.titulo}
      </h2>

      <h4 className="text-center text-sm text-white/60 mb-4">
        Watch on YouTube:{" "}
        <Link href={musica.url_video} target="_blank" className="text-purple-400 hover:underline">
          {musica.url_video}
        </Link>
      </h4>

      <h5 className="text-center text-xs text-white/40 border-t border-white/5 pt-2 pb-3">
        <Link href="/" className="text-purple-400 hover:underline font-bold">
          Back to Homepage
        </Link>
      </h5>

      {/* CONTEÚDO */}
      <div className="flex flex-col items-center max-w-4xl mx-auto gap-8 mb-16">
        {/* PLAYER */}
        <div className="w-[600px] h-[337.5px] overflow-hidden rounded border border-white/15 bg-black shadow-2xl">
          <iframe
            loading="lazy"
            width={600}
            height={337.5}
            src={urlEmbedFinal}
            title={musica.titulo ?? "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* MONTH */}
        <VideoMonthViews
          viewsAtuais={musica.views}
          primeiroRegistro={primeiroRegistroDoMes}
        />

        {/* ANALYTICS */}
        <div className="w-[600px] border border-white/10 bg-white/5 rounded p-6">
          <div className="text-xs uppercase font-bold tracking-widest text-white/30 border-b border-white/5 pb-2 mb-4">
            Statistical Analytics
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Video ID</span>
              <span className="text-red-400">{musica.id_video}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">Total Views</span>
              <span className="text-blue-400 font-bold">{viewsSuavizadas}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">Views Yesterday</span>
              <span className="text-blue-300">+{yesterdayViewsSuavizadas}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">Total Likes</span>
              <span className="text-orange-400">
                {likesSuavizados === " " ? "Hidden" : likesSuavizados}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">New Likes Yesterday</span>
              <span className="text-orange-400">
                {likesSuavizados === " " ? "Hidden" : yesterdayLikes > 0 ? `+${yesterdayLikes}` : yesterdayLikes}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">Total Comments</span>
              <span className="text-purple-400">
                {commentsSuavizados === " " ? "Hidden" : commentsSuavizados}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">New Comments Yesterday</span>
              <span className="text-purple-400">
                {commentsSuavizados === " " ? "Hidden" : yesterdayComments > 0 ? `+${yesterdayComments}` : yesterdayComments}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">Duration</span>
              <span className="text-purple-300">{musica.duration || "N/A"}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-white/50">Published At</span>
              <span className="text-purple-300">{publishedAtFormatado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PREVISÃO */}
      {previsaoViews.success ? (
        <p className="text-center text-sm text-white/70 mb-4">
          Expected to hit{" "}
          <span className="text-purple-400">{SuavizarNumero(previsaoViews.milestone!)}</span> views on{" "}
          <span className="text-purple-400">{previsaoViews.predictedDate!.toLocaleDateString()}</span> - MM/DD/YYYY.
        </p>
      ) : (
        <p className="text-center text-sm text-white/40 mb-4">{previsaoViews.message}</p>
      )}

      {/* HISTÓRICO PAGINADO */}
      <div className="container mx-auto p-4">
        <VideoHistoricList 
          id_video={id} 
          dados={historicoPaginaAtual} 
          ultimaAtualizacao={musica.ultima_atualizacao} 
        />
      </div>

      {/* PAGINAÇÃO */}
      <div className="flex justify-center items-center gap-4 mt-4 mb-4">
        {paginaAtual > 1 && (
          <Link
            href={`/video/${id}?page=${paginaAtual - 1}`}
            className="px-4 py-2 bg-purple-500/15 rounded hover:bg-purple-500/20"
          >
            Previous
          </Link>
        )}

        <span className="text-sm text-white/60">
          Page {paginaAtual} of {totalPaginas}
        </span>

        {paginaAtual < totalPaginas && (
          <Link
            href={`/video/${id}?page=${paginaAtual + 1}`}
            className="px-4 py-2 bg-purple-500/15 rounded hover:bg-purple-500/20"
          >
            Next
          </Link>
        )}
      </div>

        

        <div className="flex flex-col gap-4">

        <ReachTimeCalculator
          views={musica.views}
          likes={musica.likes}
          comments={musica.comentarios}
          historico={historicos}
          >
        </ReachTimeCalculator>
      </div>

         <div className="flex flex-col gap-4">
          <Charts
            id_musica = {musica.id_video}
            >
          </Charts>
            </div>
        
      {/* FOOTER */}
      <h5 className="text-center text-xs text-white/55 border-t border-white/5 pt-4 pb-4">
        Wanna see your favourite music here?{" "}
        <Link href="/contact" className="text-purple-400 hover:underline font-bold">
          Contact
        </Link>
      </h5>

      <h5 className="text-center text-xs text-white/40 border-t border-white/5 pt-6">
        Page Visits: {musica.visits} | <Link href="/" className="text-purple-400 hover:underline font-bold">Back to Homepage</Link>
      </h5>
    </main>
  );
}

/* ---------------- UTILS ---------------- */
function formatarLinkEmbed(url: string, id: string): string {
  if (!url) return "";
  if (url.includes("watch?v=") || url.includes("youtu.be/")) {
    return `https://www.youtube.com/embed/${id}`;
    }
    return url;
    }
