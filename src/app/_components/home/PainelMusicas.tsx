'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CardVideo from './CardVideo';

interface PainelMusicasProps {
  musicasIniciais: any[];
  paginaAtual: number;
  ordemAtual: string;
}

export default function PainelMusicas({ musicasIniciais, paginaAtual, ordemAtual }: PainelMusicasProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Função genérica para atualizar qualquer parâmetro na URL sem perder os outros
  function atualizarUrl(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(chave, valor);
    router.push(`/?${params.toString()}`);
  }

  // Avança ou volta de página alterando o número na URL
  function mudarPagina(novaPagina: number) {
    if (novaPagina < 1) return;
    atualizarUrl('pagina', novaPagina.toString());
  }

   return (
    <div className="flex flex-col gap-6">
      
      {/* SEÇÃO DE FILTROS (Alinhado à esquerda) */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-mono text-white/40">ORDER BY:</label>
        <select
          value={ordemAtual}
          onChange={(e) => atualizarUrl('ordem', e.target.value)}
          className="bg-purple-900/35 border-2 border-white/20 rounded px-2 py-1 text-xs text-white/85 outline-none font-mono cursor-pointer focus:border-purple-500/35"
        >
          <option value="views_desc" className="bg-black text-white">Most Viewed</option>
          <option value="views_asc" className="bg-black text-white">Least Viewed</option>
          <option value="idade_desc" className="bg-black text-white">Newest Release</option>
          <option value="idade_asc" className="bg-black text-white">Oldest Release</option>
        </select>
      </div>

      {/* CABEÇALHO DE INDICADORES (Alinhamento simétrico com as caixas fixas) */}
      <div className="flex items-center w-full px-4 py-2 font-mono text-[10px] font-bold text-white/30 tracking-wider uppercase select-none border-b border-white/5 mb-1">
        {/* Espaço morto para pular o número do ranking do card de baixo */}
        <span className="min-w-[5px] "></span>
        <span>ID</span>
        <span className="min-w-[20px] mr-3"></span>
        <span>Title</span>

        {/* Indicadores fixados na direita combinando com o w-24 e gap-2 do CardVideo */}
        <div className="flex items-center ml-auto gap-2 text-center">
          <span className="w-24">Views</span>
          <span className="w-24">Likes</span>
          <span className="w-24">Age</span>
        </div>
      </div>

      {/* CONTÊINER VERTICAL DOS CARDS */}
      <div className="flex flex-col">
        {musicasIniciais.length > 0 ? (
          musicasIniciais.map((musica, index) => {
            // Calcula o número do ranking considerando a página atual (Ex: página 2 começa no #26)
            const posicaoRanking = (paginaAtual - 1) * 25 + (index + 1);
            return (
              <CardVideo 
                key={musica.id_video} 
                musica={musica} 
                posicao={posicaoRanking}
              />
            );
          })
        ) : (
          <p className="text-sm text-white/40 text-center py-8 font-mono">
            No music found matching the criteria.
          </p>
        )}
      </div>

      {/* SISTEMA DE PÁGINAS (Rodapé) */}
      <div className="flex items-center justify-center gap-4 mt-4 font-mono">
        <button
          onClick={() => mudarPagina(paginaAtual - 1)}
          disabled={paginaAtual === 1}
          className="px-3 py-1 text-xs border-2 border-white/20 rounded bg-purple-900/10 text-white/80 transition-colors hover:border-purple-500/35 disabled:opacity-30 disabled:hover:border-white/20 disabled:cursor-not-allowed"
        >
          &lt; Previous
        </button>

        <span className="text-xs text-white/60">
          Page {paginaAtual}
        </span>

        <button
          onClick={() => mudarPagina(paginaAtual + 1)}
          // Desativa o botão se a página atual trouxe menos de 25 músicas (sinal de que a lista acabou)
          disabled={musicasIniciais.length < 25}
          className="px-3 py-1 text-xs border-2 border-white/20 rounded bg-purple-900/10 text-white/80 transition-colors hover:border-purple-500/35 disabled:opacity-30 disabled:hover:border-white/20 disabled:cursor-not-allowed"
        >
          Next &gt;
        </button>
      </div>

    </div>
  );
}