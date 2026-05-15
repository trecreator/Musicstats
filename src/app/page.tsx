export const dynamic = 'force-dynamic';


import PainelMusicas from './_components/home/PainelMusicas';
import { buscarMusicasAvancado } from './actions/searchMusic'; // Importação alterada para a nova função
import { SuavizarNumero } from '@/utils/math';

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

    // 2. Dispara a busca inteligente unificada no MySQL
    const musicas = await buscarMusicasAvancado(termoBusca, paginaAtual, 25, ordemFiltro);
    
    // 3. Cálculos dinâmicos baseados no resultado atual do banco
    const totalViewsInPage = SuavizarNumero(musicas.reduce((total, musica) => total + musica.views, 0));
    const MusicasEncontradas: number = musicas.length;

  return (
    <main className="px-30 mt-[100px] min-h-screen bg-yellow-900/1 ">
      
      <div className="p-6 max-w-5xl mx-auto text-sm text-white/80 font-mono">
        Search and see kworb style music analytics. 
      </div>

      {/* Exibe a contagem de músicas dinâmica baseada na busca/página */}
      <div className="p-3 max-w-5xl mx-auto text-sm text-white/80 font-mono">
        {MusicasEncontradas} listed musics on this page | total views in this page: {totalViewsInPage}
      </div>

      {/* 4. Passamos os dados e os estados da URL para o Painel criar os botões e filtros */}
      <div className="p-2 max-w-5xl mx-auto">
        <PainelMusicas 
          musicasIniciais={musicas} 
          paginaAtual={paginaAtual}
          ordemAtual={ordemFiltro}
        />
      </div>

    </main>
  );
}
