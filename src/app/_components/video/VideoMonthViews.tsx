import React from "react";

interface PrimeitoRegistro {
  views: number;
  capturado_em: string | Date;
}

interface VideoMonthViewsProps {
  viewsAtuais: number;
  primeiroRegistro: PrimeitoRegistro | null;
}

export default function VideoMonthViews({ viewsAtuais, primeiroRegistro }: VideoMonthViewsProps) {
  if (!primeiroRegistro) {
    return (
      <div className="w-[600px] mx-auto mt-4 border border-white/10 bg-white/5 rounded backdrop-blur-md p-4 font-mono text-xs text-white/40 text-center">
        Sem dados históricos suficientes para o mês atual.
      </div>
    );
  }

  // Calcula a diferença de views ganhas no mês corrente
  const viewsGanhasNoMes = viewsAtuais - primeiroRegistro.views;
  
  // Formata a data de início da contagem
  const dataInicio = new Date(primeiroRegistro.capturado_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  return (
    <div className="w-[600px] mx-auto mt-4 border border-purple-500/20 bg-purple-950/10 rounded backdrop-blur-md p-4 font-mono">
      <div className="flex justify-between items-center text-sm">
        <div className="flex flex-col">
          <span className="text-white/50 text-xs uppercase font-bold tracking-wider">Views This Month</span>
          <span className="text-white/30 text-xxs mt-0.5">Counting since: {dataInicio}</span>
        </div>
        <span className="text-green-400 font-bold text-lg">
          +{viewsGanhasNoMes.toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );
}
