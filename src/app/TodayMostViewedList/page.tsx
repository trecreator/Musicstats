// Define que a página será gerada no servidor e salva em cache por 1 hora
export const revalidate = 3600;

import Link from "next/link";
import { buscarMaisVistasHoje } from "@/app/actions/searchMusic";
import { SuavizarNumero } from "@/utils/math";

export default async function TodayMostViewedListPage() {
  // Busca todas as músicas já ordenadas e calculadas pelo banco
  const topViewedToday = await buscarMaisVistasHoje();

  if (!topViewedToday || topViewedToday.length === 0) {
    return (
      <main className="pt-24 min-h-screen bg-black text-white p-6 font-mono text-center">
        <h1>No statistics found for today.</h1>
        <Link href="/" className="text-purple-400 hover:underline block mt-4">
          Back to Homepage
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-[120px] pb-16 min-h-screen bg-purple-900/5 text-white p-6 font-mono">
      <div className="max-w-3xl mx-auto">
        
        {/* CABEÇALHO DA PÁGINA */}
        <h1 className="text-center text-3xl font-bold uppercase tracking-wider mb-2 text-white">
          Today's Most Viewed
        </h1>
        <p className="text-center text-xs text-white/40 mb-8 border-b border-white/5 pb-4">
          Updated hourly &nbsp;|&nbsp; Total: {topViewedToday.length} tracks
        </p>

         <div className="text-center mt-8">
          <Link
            href="/"
            className="text-xs uppercase font-bold tracking-widest text-white/40 hover:text-purple-400 transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>


        {/* LISTA COMPLETA LEVE E PERFORMANCE */}
        <div className="space-y-3 bg-white/5 rounded border border-white/10 p-6 backdrop-blur-md">
          {topViewedToday.map((musica, index) => {
            // Evita exibir números negativos caso o histórico esteja desalinhado
            const viewsOntem = musica.yesterdayViews || 0;

            return (
              <div 
                key={musica.id_video} 
                className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-none last:pb-0"
              >
                <div className="flex items-center gap-2 overflow-hidden mr-4">
                  <span className="text-white/30 font-bold w-6 text-right">
                    {index + 1}.
                  </span>
                  <Link
                    href={`/video/${musica.id_video}`}
                    className="text-purple-400 hover:text-purple-300 hover:underline font-medium truncate"
                    title={musica.titulo}
                  >
                    {musica.titulo}
                  </Link>
                </div>
                
                <span className="text-blue-300 font-semibold shrink-0">
                  +{SuavizarNumero(viewsOntem)} views
                </span>
              </div>
            );
          })}
        </div>

        {/* VOLTAR PARA HOME */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-xs uppercase font-bold tracking-widest text-white/40 hover:text-purple-400 transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>

      </div>
    </main>
  );
}
