import PainelMusicas from './_components/home/PainelMusicas';
import { buscarTodasAsMusicas } from './actions/searchMusic';

// 1. Adicionado o "async" para permitir o uso de await no servidor
export default async function MainPage() {

    // 2. Adicionado o "await" para esperar os dados do banco de dados chegarem
    const musicas = await buscarTodasAsMusicas(25, 0);
    
    // Como 'musicas' agora é um array real (e não uma promessa), o .length funciona perfeitamente
    let MusicasEncontradas: number = musicas.length;

  return (
    <main className="pt-24 min-h-screen bg-yellow-900/1">
      
      {/* Exibe a contagem de músicas inicial */}
      <div className="p-6 max-w-5xl mx-auto text-sm text-white/80 font-mono">
        {MusicasEncontradas} listed musics on this page. 
      </div>

      {/* 3. Corrigido a tag de fechamento do componente e injetado os dados iniciais */}
      <div className="p-2 max-w-5xl mx-auto">
        <PainelMusicas musicasIniciais={musicas} />
      </div>

    </main>
  );
}
