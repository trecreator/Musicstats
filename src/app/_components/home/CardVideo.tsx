import { Musica, CalcularIdadeMusica } from "@/types/music"; 
import { SuavizarNumero } from "@/utils/math";
import Link from "next/link";

interface CardVideoProps {
  musica: Musica;
  posicao: number;
}

export default function CardVideo({ musica, posicao }: CardVideoProps) {
  
  let views: string = SuavizarNumero(musica.views) ?? " ";
  let likes: string = SuavizarNumero(musica.likes) ?? " ";
  let idade: string = CalcularIdadeMusica(musica.published_at) ?? " ";

  return (
    <Link href={`/video/${musica.id_video}`} className="w-full">
    <div className="flex items-center w-full p-4 mb-1 bg-white/3 border border-purple-900/45 outline outline-1 hover:bg-white/5 hover:border-blue-500/50 hover:outline-blue-500/20 transition-all duration-300">
      
      {/* Posição do Ranking (Discreta, antes do título) */}
      <span className="text-xs font-mono text-purple-400 mr-3 min-w-[20px]">
        #{posicao}
      </span>

      {/* Título da Música */}
      <h2 className="font-semibold text-white/90 tracking-wide truncate max-w-[50%] hover:text-blue-200 transition-colors duration-300">
        {musica.titulo || "Sem título"}
      </h2>

      {/* Bloco de Atributos (Mesmo gap do cabeçalho) */}
      <div className="flex items-center ml-auto gap-2 font-mono text-xs text-white/60">
        
        {/* Caixinha de Views (Largura fixa e texto centralizado) */}
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
