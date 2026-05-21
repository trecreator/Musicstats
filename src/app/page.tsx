export const dynamic = 'force-dynamic';

import PainelMusicas from './_components/home/PainelMusicas';
import { buscarMusicasAvancado, buscarGanhosOntemLote, buscarUltimaAtualizacao } from './actions/searchMusic'; // Adicionada a nova função em lote
import { SuavizarNumero } from '@/utils/math';
import Link from 'next/link';

interface MainPageProps {
  searchParams: Promise<{ 
    busca?: string; 
    pagina?: string; 
    ordem?: string; 
  }>;
}

export default async function MainPage({ searchParams }: MainPageProps) {
    // 1. Captura as variáveis direto da URL do navegador de forma assíncrona
    const params = await searchParams;
    const termoBusca = params.busca ?? "";
    const paginaAtual = Number(params.pagina) || 1;
    const ordemFiltro = params.ordem ?? "views_desc";
const ultimaAtualizacao = await buscarUltimaAtualizacao();
    // 2. Dispara a busca inteligente unificada no MySQL
    const musicasOrdinarias = await buscarMusicasAvancado(termoBusca, paginaAtual, 25, ordemFiltro);
    
    // --- NOVO: BUSCA E INJEÇÃO DOS GANHOS DE ONTEM EM LOTE ---
    const idsVideos = musicasOrdinarias.map((m) => m.id_video);
    const mapaHistoricoOntem = await buscarGanhosOntemLote(idsVideos);

    const musicas = musicasOrdinarias.map((musica) => {
      const viewsOntem = mapaHistoricoOntem[musica.id_video] || 0;
      // Calcula as views ganhas em 24h: Atual menos a foto de ontem
      const yesterdayViews = viewsOntem > 0 ? musica.views - viewsOntem : 0;

       


      return {
        ...musica,
        yesterdayViews: yesterdayViews > 0 ? yesterdayViews : 0,
      };
    });
    // --------------------------------------------------------

    const topViewedToday = [...musicas]
    .sort((a, b) => b.yesterdayViews - a.yesterdayViews)
    .slice(0, 3);

    // 3. Cálculos dinâmicos baseados no resultado atual do banco
    const totalViewsInPage = SuavizarNumero(musicas.reduce((total, musica) => total + musica.views, 0));
    const MusicasEncontradas: number = musicas.length;

  return (
    <main className="px-30 mt-[100px] min-h-screen bg-yellow-900/1 ">
      
      <div className="p-6 max-w-5xl mx-auto text-sm text-white/80 font-mono">
        Search and see kworb style music analytics. <p>Last DataBank update: <span className="text-purple-400">{ultimaAtualizacao}.</span></p> <p>Wanna see your favorite music here? Request it  
        <Link href="/contact" className="text-purple-400 hover:text-purple-300 hover:underline">
              <> </>here
        </Link>
        </p>

        <p className="mt-4 text-white font-semibold">
  Most viewed musics today:
</p>

{topViewedToday.map((musica, index) => (
  <p key={musica.id_video}>
    {index + 1}.{" "}
    <Link
      href={`/video/${musica.id_video}`}
      className="text-purple-400 hover:underline"
    >
      {musica.titulo}
    </Link>{" "}
    - {SuavizarNumero(musica.yesterdayViews)} views
  </p>
))}

      </div>

      {/* Exibe a contagem de músicas dinâmica baseada na busca/página */}
      <div className="p-3 max-w-5xl mx-auto text-sm text-white/80 font-mono">
        {MusicasEncontradas} listed musics on this page | total views in this page: {totalViewsInPage}
      </div>

      {/* 4. Passamos os dados e os estados da URL para o Painel criar os botões e filtros */}
      <div className="p-2 max-w-5xl mx-auto">
        <PainelMusicas 
          musicasIniciais={musicas} // Agora envia o objeto com a propriedade yesterdayViews inclusa!
          paginaAtual={paginaAtual}
          ordemAtual={ordemFiltro}
        />
      </div>

    </main>
  );
}
