import React from "react";

interface HistoricoItem {
  views: number;
  likes: number;
  comentarios: number;
  capturado_em: string | Date;
}

export default function VideoHistoricList({ dados }: { dados: HistoricoItem[] }) {
  if (!dados || dados.length === 0) {
    return (
      <div className="text-center text-sm text-white/40 font-mono my-8">
        No records found in the history.
      </div>
    );
  }

  // Captura a data da atualização mais recente (primeiro item do array)
  const ultimaAtualizacao = dados[0].capturado_em;

  return (
    <div className="max-w-5xl mx-auto mt-12 bg-white/5 border border-white/10 rounded backdrop-blur-md p-6 font-mono">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 mb-4 gap-2">
        <div className="text-xs uppercase font-bold tracking-widest text-white/30">
          Historical Evolution
        </div>
        {/* Exibindo a variável da atualização mais recente no topo */}
        <div className="text-xs text-purple-400 font-semibold">
          Last Update: {new Date(ultimaAtualizacao).toLocaleString("pt-BR")}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50 text-xxs uppercase tracking-wider whitespace-nowrap">
              <th className="p-3 pl-1">Date / Hour</th>
              <th className="p-3 text-right">Total Views</th>
              <th className="p-3 text-right">Earned Views</th>
              <th className="p-3 text-right">Total Likes</th>
              <th className="p-3 text-right">Earned Likes</th>
              <th className="p-3 text-right">Total Comments</th>
              <th className="p-3 text-right">Earned Comments</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((item, index) => {
              // Item imediatamente posterior no array representa o registro anterior no tempo
              const registroAnterior = dados[index + 1];
              
              // Cálculos de ganhos por período
              const diferencaViews = registroAnterior ? item.views - registroAnterior.views : 0;
              const diferencaLikes = registroAnterior ? item.likes - registroAnterior.likes : 0;
              const diferencaComentarios = registroAnterior ? item.comentarios - registroAnterior.comentarios : 0;

              return (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors whitespace-nowrap">
                  {/* Data e Hora */}
                  <td className="p-3 pl-1 text-white/80">
                    {new Date(item.capturado_em).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  
                  {/* VISUALIZAÇÕES */}
                  <td className="p-3 text-right text-blue-400 font-semibold">
                    {item.views.toLocaleString("pt-BR")}
                  </td>
                  <td className={`p-3 text-right font-bold ${diferencaViews > 0 ? 'text-green-400' : 'text-white/40'}`}>
                    {registroAnterior ? `+${diferencaViews.toLocaleString("pt-BR")}` : "—"}
                  </td>

                  {/* LIKES */}
                  <td className="p-3 text-right text-orange-400">
                    {item.likes.toLocaleString("pt-BR")}
                  </td>
                  <td className={`p-3 text-right font-bold ${diferencaLikes > 0 ? 'text-green-400' : (diferencaLikes < 0 ? 'text-red-400' : 'text-white/40')}`}>
                    {registroAnterior ? (diferencaLikes >= 0 ? `+${diferencaLikes.toLocaleString("pt-BR")}` : diferencaLikes.toLocaleString("pt-BR")) : "—"}
                  </td>

                  {/* COMENTÁRIOS */}
                  <td className="p-3 text-right text-purple-400">
                    {item.comentarios.toLocaleString("pt-BR")}
                  </td>
                  <td className={`p-3 text-right font-bold ${diferencaComentarios > 0 ? 'text-green-400' : (diferencaComentarios < 0 ? 'text-red-400' : 'text-white/40')}`}>
                    {registroAnterior ? (diferencaComentarios >= 0 ? `+${diferencaComentarios.toLocaleString("pt-BR")}` : diferencaComentarios.toLocaleString("pt-BR")) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
