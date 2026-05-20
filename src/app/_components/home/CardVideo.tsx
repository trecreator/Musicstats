import { Musica, CalcularIdadeMusica } from "@/types/music"; 
import { SuavizarNumero } from "@/utils/math";
import Link from "next/link";

interface CardVideoProps {
  musica: Musica & { yesterdayViews?: number };
  posicao: number;
}

export default function CardVideo({ musica, posicao }: CardVideoProps) {
  
  let views: string = SuavizarNumero(musica.views) ?? " ";
  let likes: string = SuavizarNumero(musica.likes) ?? " ";
  let idade: string = CalcularIdadeMusica(musica.published_at) ?? " ";

  // --- CÁLCULO DA PORCENTAGEM DE CRESCIMENTO ---
  const viewsGanhasOntem = musica.yesterdayViews || 0;
  const viewsAntesDeOntem = musica.views - viewsGanhasOntem;

  // Formata com até 3 casas decimais e remove os zeros flutuantes inúteis da ponta (ex: 2.500 vira 2.5)
  const porcentagemCrescimento = viewsAntesDeOntem > 0 
    ? Number(((viewsGanhasOntem / viewsAntesDeOntem) * 100).toFixed(3)).toString().replace(".", ",")
    : "0";

  return (
    <Link href={`/video/${musica.id_video}`} className="w-full">
      <div className="flex items-center w-full p-4 mb-1 bg-white/1 border border-purple-900/45 rounded outline outline-1 rounded hover:bg-white/5 hover:border-blue-500/50 hover:outline-blue-500/20 rounded transition-all duration-300">
        
        {/* 1. Posição do Ranking */}
        <span className="text-xs font-mono text-purple-400 mr-2 min-w-[25px]">
          #{posicao}
        </span>

        {/* 2. Área do Título Bloqueada: Não deixa o texto empurrar os vizinhos */}
        <div className="w-[220px] md:w-[320px] shrink-0 truncate pr-4">
          <h2 className="font-semibold text-white/90 tracking-wide text-sm inline hover:text-blue-200 transition-colors duration-300">
            {musica.titulo || "Sem título"}
          </h2>
        </div>

        {/* 3. TENDÊNCIA TOTALMENTE FIXA: Alinhada perfeitamente em coluna */}
        <div className="w-32 shrink-0 hidden sm:block font-mono text-xs text-green-400 select-none cursor-default">
          +{porcentagemCrescimento}% yesterday views growth
        </div>

        {/* 4. Bloco de Atributos (Alinhado totalmente à direita) */}
        <div className="flex items-center ml-auto gap-2 font-mono text-xs text-white/60">
          
          {/* Caixinha de Views */}
          <span 
            className="w-24 py-1 text-center bg-white/0 border border-white/10 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300 tooltip cursor-default" 
            title="Views"
          >
            {views}
          </span>

          {/* Caixinha de Likes */}
          <span 
            className="w-24 py-1 text-center bg-white/0 border border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 tooltip cursor-default" 
            title="Likes"
          >
            {likes}
          </span>

          {/* Caixinha de Idade */}
          <span 
            className="w-24 py-1 text-center bg-white/0 border border-white/10 hover:text-orange-400/80 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300 tooltip cursor-default" 
            title="Age"
          >
            {idade}
          </span>

        </div>
      </div>
    </Link>
  );
}
