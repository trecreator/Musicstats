"use client";

import { useState, useEffect } from "react";
import { Line, LineChart, YAxis, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BuscarCharts, HistoricoMusica } from '@/app/actions/searchMusic';
import  ToolTip  from './ToolTip';

interface Props {
    id_musica: string
}

const options = [
"views",
"likes",
"comentarios"
]

export default function Charts({ id_musica }: Props) {

        const [resultado, setResultado] = useState<any>([]);
        
        let [metric, setMetric] = useState<string>("likes");
        useEffect(() => {
        async function BuscarDados(){

            setResultado(await BuscarCharts(id_musica, metric));

        }

        BuscarDados();

    }, [metric]
    );
   
    let data: any = [];
   
    
    
   for (let i = 1; i < resultado.length; i++){
   
        const crescimento = resultado[i][metric] - resultado[i - 1][metric];
        
    data.push(
        { name: resultado[i].capturado_em.getDate() + "/" + (resultado[i].capturado_em.getMonth() + 1),
          uv: crescimento,
           
    });
}

const [mousePosition, setMousePosition] = useState<{

x: any,
y: any,
dado: any,
nomeDado: string

} | null >(null);


    return (
    <div className="mt-3 overflow-hidden rounded-lg border-2 border-purple-500/70 relative">
        
        {/* Cabeçalho */}
        <div className="flex h-14 items-center justify-between bg-purple-500/70 px-4">

            <h2 className="font-medium text-white">
                {metric} growth per day since first music's databank record
            </h2>

            <select
                value={metric}
                onChange={(e) => {
                    setMetric(e.target.value);
                }}
                className="rounded bg-purple-950 px-2 py-1 text-white outline-none"
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option === "comentarios"
                            ? "comments"
                            : option}
                    </option>
                ))}
            </select>

        </div>

        {/* Gráfico */}
        <div className="h-[300px] w-full p-3">
 <ResponsiveContainer width="100%" height="100%">
            <LineChart
                width={300}
                height={280}
                data={data}
                margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,

                }}
                    
                onMouseMove={(e) => {
                    
                    const indice = e.activeTooltipIndex;
                    if (indice != null) {
                    const dados = data[indice];
                    setMousePosition({
                        x: e.activeCoordinate?.x,
                        y: e.activeCoordinate?.y,
                        nomeDado: dados.name,
                        dado: dados.uv
                       
                    })
                    console.log(mousePosition);
                }}}
                onMouseLeave={(e) => {setMousePosition(null);}}
    
               

            >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                    dataKey="name"
                    interval={3}
                />

                <YAxis
                    label={{
                        value: `${metric} growth`,
                        angle: -90,
                        position: "insideLeft",
                        offset: -5
                    }}
                />

              
                <Line
                    type="monotone"
                    dataKey="uv"
                    stroke="#550088"
                    strokeWidth={3}
                  
                />



            </LineChart>
            
                    
                    
</ResponsiveContainer>
        </div>

    
    
                      <div className="">
                         {mousePosition && (
            <ToolTip
                dado={mousePosition.dado}
                nomeDado={mousePosition.nomeDado}
                x={mousePosition.x}
                y={mousePosition.y}
            />
        )}</div>
        </div>

    );
}