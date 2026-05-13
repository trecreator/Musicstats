import { Musica, CalcularIdadeMusica } from "@/types/music"; 
import { SuavizarNumero } from "@/utils/math";

interface CardVideoProps {
  musica: Musica;
}


export default function CardVideo({ musica }: CardVideoProps) {
  
  let views: string = SuavizarNumero(musica.views) ?? " ";
  let likes: string = SuavizarNumero(musica.likes) ?? " ";
  let idade: string = CalcularIdadeMusica(musica.published_at) ?? " ";


  return (
    <div className="flex items-center w-full p-4 mb-1 bg-white/3 border border-purple-900/45  outline outline-1 hover:bg-white/5 hover:border/blue-500/50 hover:outline-blue-500/20 transition-all duration-300">
      {}
      <h2 className="text-semibold text-white/90 tracking-wide truncate max-w-[60%] hover:text-blue-200 transition-colors duration-300">{musica.titulo || "Sem título"}</h2>

      <div className="flex gap-6 items-center ml-auto font-mono text-xs text-white/60">
        <span className="hover:text-blue-400 transition-colors duration-300 tooltip" title="Views">
          {views}
        </span>
        <span className="hover:text-red-400 transition-colors duration-300 tooltip" title="Likes">
          {likes}
        </span>
        <span className="hover:text-orange-400/80 transition-colors duration-300 tooltip" title="Age">
          {idade}
        </span>
      </div>
    </div>
  );
}
