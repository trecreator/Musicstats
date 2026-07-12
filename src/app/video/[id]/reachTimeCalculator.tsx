"use client";

import { useState } from "react";
import { SuavizarNumero } from "@/utils/math";
import { HistoricoMusica } from "@/app/actions/searchMusic";

interface VideoCalculatorProps {

    views: number;
    likes: number;
    comments: number;
    historico: HistoricoMusica[];

}

export default function ReachTimeCalculator({views, likes, comments, historico}: VideoCalculatorProps) {

const [objetivo, setObjetivo] = useState<number>(0);
const [metric, setMetric] = useState<string>("views");
const options = [];
let valorAtual = 0;

if (views > 0 ){
    options.push("views")
}
if (likes > 0 ){
    options.push("likes")
}
if (comments > 0 ){
    options.push("comments")
    
}

if (metric === "views"){
    valorAtual = views;
} else if (metric === "likes") {
    valorAtual = likes;
} else if (metric === "comments") {
    valorAtual = comments;

}

const calculo = Calcular(objetivo, metric, valorAtual, historico);

return(
<div className="flex flex-col gap-6 rounded-lg border-2 border-purple-500/70">
<div className="flex items-center justify-between bg-purple-500/70 px-4">
    <div className="flex flex-col gap-4 text-sl text-white font-medium p-1">
        Calculate an estimate of when this song will reach a specific number of {metric} based on the last three growth periods. Please, enter the number of {metric} you want to calculate and the metric.
    </div>

    <div className="flex gap-6 pr-2 rounded bg-purple-950 px-2 py-1 outline-none w-[200]">
        <input 
        
        type="number"
     value={objetivo === 0 ? "" : objetivo}
      placeholder="Target here"
       onChange={ (e) => {
        const apenasNumeros = e.target.value.replace(/\D/g, "");
        Number(e.target.value) >= 100000000000 ? setObjetivo(Number(100000000000)) : setObjetivo(Number(apenasNumeros));
        
    }}
       />
    </div>
<p className="pl-2">
    <select
        value={metric}
        onChange={
            (e) => {setMetric(e.target.value);
                
            }
        }
        className="bg-purple-950 px-2 py-1 outline-none rounded"
      >
        {options.map((option) => (
            <option 
            className="text-white bg-purple-950 rounded-[4]"
            key={option}
            value={option}
            >
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
        ))}

    </select>
    </p>
</div>
<div className="pl-3 pb-3">
    <p>
      Metric: {metric}
    </p>

    <p>
        Target: {objetivo === 0 ?  "Not defined by you" :   SuavizarNumero(objetivo) }
    </p>

    <p>
        Current: {SuavizarNumero(valorAtual)}
    </p>

    <p>
        Result: {calculo}
    </p>
</div>
</div>
);
}

function Calcular(target:number, metric:string, valorAtual:number, historico: HistoricoMusica[]): string{


        if (metric == "comments"){ metric = "comentarios";}

        if (historico.length < 4 || target === 0){ return "Not enough data to calculate";} 

        let crescimentoA = historico[1][metric] - historico[0][metric];
        let crescimentoB = historico[2][metric] - historico[1][metric];
        let crescimentoC = historico[3][metric] - historico[2][metric];
        
        let ganhosAcumulados = (crescimentoA + crescimentoB + crescimentoC) / 3;

        let distancia: number = target - valorAtual;
        if ( distancia <= 0) { return "The target has already been reached";}
        let previsaoEmDias: number = distancia / ganhosAcumulados;
        if (previsaoEmDias < 1) { return "The target will be reached today";}
        let previsaoEmMeses: number = previsaoEmDias / 30;
        let restoDias: number = Math.ceil(previsaoEmDias % 30)
        if ( previsaoEmMeses <= 12 ) {
            
             if (restoDias > 0) {
                return "The target will be reached in " + Math.floor(previsaoEmMeses) + " Months and " + restoDias + " Days."
             } else return "The target will be reached in " + Math.floor(previsaoEmMeses) + " Months."

            }

            if ( previsaoEmMeses >= 12 ) {
        return "The target will be reached in " + Math.round(previsaoEmMeses / 12) + " Years, " + Math.floor(previsaoEmMeses % 12) + " Months and " + Math.ceil(previsaoEmDias % 30) + " Days.";
            } else

        

       


    return "Not enough data to calculate";
}