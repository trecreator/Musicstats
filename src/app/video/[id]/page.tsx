export const revalidate = 3600;

import { headers } from "next/headers";
import Link from "next/link";
import { calcularPrevisaoViews } from "@/utils/predictions";

import {
  registrarVisitaMusica,
  buscarMusicaPorId,
  listarHistoricoCompleto,
  buscarPrimeiroRegistroDoMes,
  buscarHistoricoOntem,
} from "@/app/actions/searchMusic";

import { SuavizarNumero } from "@/utils/math";

import VideoHistoricList from "@/app/_components/video/VideoHistoricList";
import VideoMonthViews from "@/app/_components/video/VideoMonthViews";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  // 1. OTIMIZAÇÃO: Busca apenas os dados primordiais primeiro
  const musica = await buscarMusicaPorId(id);

  if (!musica || !musica.url_video) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>Music or URL not found in our database.</h1>
      </main>
    );
  }

  // 2. CAPTURA IP E REGISTRO ASSÍNCRONO (Não bloqueia o carregamento HTML)
  const cabecalhos = await headers();
  const ipUsuario =
    cabecalhos.get("x-forwarded-for")?.split(",")[0] ||
    cabecalhos.get("x-real-ip") ||
    "127.0.0.1";

  registrarVisitaMusica(id, ipUsuario).catch((err) =>
    console.error("Erro assíncrono ao registrar visita:", err)
  );

  // 3. OTIMIZAÇÃO: Paralelismo de banco via Promise.all (3x mais rápido)
  const [historicoOntem, historicoCompleto, primeiroRegistroDoMes] = await Promise.all([
    buscarHistoricoOntem(id),
    listarHistoricoCompleto(id),
    buscarPrimeiroRegistroDoMes(id),
  ]);

  // FALLBACKS
  const yesterdayViews = historicoOntem ? musica.views - historicoOntem.views : 0;
  const yesterdayLikes = historicoOntem ? musica.likes - historicoOntem.likes : 0;
  const yesterdayComments = historicoOntem ? musica.comentarios - historicoOntem.comentarios : 0;

  // FORMATADOS
  const viewsSuavizadas = SuavizarNumero(musica.views);
  const yesterdayViewsSuavizadas = SuavizarNumero(yesterdayViews);
  const likesSuavizados = SuavizarNumero(musica.likes);
  const commentsSuavizados = SuavizarNumero(musica.comentarios);

  const publishedAtFormatado = musica.published_at
    ? new Date(musica.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Unknown";

  // URL EMBED
  const urlEmbedFinal = formatarLinkEmbed(musica.url_video, musica.id_video);

  const previsaoViews = calcularPrevisaoViews(musica.views, historicoCompleto);

  return (
    <main className="pt-[120px] min-h-screen bg-purple-900/5 text-white p-6 font-mono">

    {/* DADOS ESTRUTURADOS PARA O GOOGLE INDEXAR COMO VÍDEO */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": musica.titulo,
      "description": `Assista e confira as estatísticas de ${musica.titulo}`,
      "thumbnailUrl": musica.thumbnail || `https://youtube.com{musica.id_video}/maxresdefault.jpg`,
      "uploadDate": musica.published_at ? new Date(musica.published_at).toISOString() : new Date().toISOString(),
      "embedUrl": urlEmbedFinal,
      // Se a duração estiver no formato "03:45", convertemos para o padrão ISO que o Google exige (PT3M45S)
      "duration": musica.duration ? `PT${musica.duration.split(':')[0]}M${musica.duration.split(':')[1]}S` : undefined
    })
  }}
/>



      {/* TÍTULO */}
      <h2 className="text-center text-2xl text-white mb-2 font-bold uppercase tracking-wider max-w-3xl mx-auto">
        {musica.titulo}
      </h2>

      <h4 className="text-center text-sm text-white/60 mb-4">
        Watch on YouTube:{" "}
        <Link
          href={musica.url_video}
          target="_blank"
          className="text-purple-400 hover:text-purple-300 hover:underline transition-colors"
        >
          {musica.url_video}
        </Link>
      </h4>

      <h5 className="text-center text-xs text-white/40 border-t border-white/5 pt-2 max-w-xl mx-auto pb-3">
        <Link
          href="/"
          className="items-center text-purple-400 hover:text-purple-300 hover:underline ml-1 font-bold"
        >
          Back to Homepage
        </Link>
      </h5>

      {/* CONTEÚDO */}
      <div className="flex flex-col items-center max-w-4xl mx-auto gap-8 mb-16">

        {/* PLAYER */}
        <div className="w-[600px] h-[337.5px] overflow-hidden rounded border border-white/15 bg-black shadow-2xl shadow-purple-950/20">
          <iframe
            loading="lazy"
            width={600}
            height={337.5}
            src={urlEmbedFinal}
            title={`Reproduzir ${musica.titulo}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full object-cover"
          />
        </div>

        {/* MENSAL */}
        <VideoMonthViews
          viewsAtuais={musica.views}
          primeiroRegistro={primeiroRegistroDoMes}
        />

        {/* ANALYTICS */}
        <div className="w-[600px] border border-white/10 bg-white/5 rounded backdrop-blur-md p-6 font-mono">

          <div className="text-xs uppercase font-bold tracking-widest text-white/30 border-b border-white/5 pb-2 mb-4">
            Statistical Analytics
          </div>

          <div className="space-y-3">

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Video ID</span>
              <span className="text-red-400 font-semibold">
                {musica.id_video}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Total Views</span>
              <span className="text-blue-400 font-bold text-base">
                {viewsSuavizadas}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Views Yesterday</span>
              <span className="text-blue-300 font-semibold">
                +{yesterdayViewsSuavizadas}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Total Likes</span>
              <span className="text-orange-400 font-semibold">
                {likesSuavizados === " " ? "Hidden by artist" : likesSuavizados}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">New Likes Yesterday</span>
              <span className="text-orange-300 font-semibold">
                {yesterdayLikes === 0 ? "Hidden by artist" : `${yesterdayLikes >= 0 ? "+" : "-"}${Math.abs(yesterdayLikes).toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Total Comments</span>
              <span className="text-purple-400 font-semibold">
                {commentsSuavizados === " " ? "Hidden by artist" : commentsSuavizados}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">New Comments Yesterday</span>
              <span className="text-purple-300 font-semibold">
                {commentsSuavizados === " " ? " " : yesterdayComments >= 0 ? "+" : "-"}
                {commentsSuavizados === " " ? "Hidden by artist" :Math.abs(yesterdayComments).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-white/50">Duration</span>
              <span className="text-purple-300 font-semibold">
                {musica.duration || "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/50">Published At</span>
              <span className="text-purple-300 font-semibold">
                {publishedAtFormatado}
              </span>
            </div>

          </div>
        </div>

      </div>

      {previsaoViews.success ? (
        <p className="text-center text-sm text-white/70 font-mono mb-4">
          Expected to hit{" "}
          <span className="text-purple-400">
            {SuavizarNumero(previsaoViews.milestone!)}
          </span>{" "}
          views on{" "}
          <span className="text-purple-400">
            {previsaoViews.predictedDate!.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </p>
      ) : (
        <p className="text-center text-sm text-white/40 font-mono mb-4">
          {previsaoViews.message}
        </p>
      )}

      {/* HISTÓRICO */}
      <div className="container mx-auto p-4">
        <VideoHistoricList dados={historicoCompleto} />
      </div>

      {/* RODAPÉ */}
      <h5 className="text-center text-xs text-white/40 border-t border-white/5 pt-6 max-w-xl mx-auto">
        Page Visits: {musica.visits}
        &nbsp;|&nbsp;
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 hover:underline ml-1 font-bold"
        >
          Back to Homepage
        </Link>
      </h5>

    </main>
  );
}

function formatarLinkEmbed(url: string, id: string): string {
  if (!url) return "";
  if (url.includes("watch?v=") || url.includes("youtu.be/")) {
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}
