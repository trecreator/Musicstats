'use client';

import BarraBusca from "./BarraDePesquisaMusicas";

export default function GuiaFixa()
{
    
    return(

        <nav className="fixed top-0 w-full p-4 border-b border-white/20 bg-purple-900/25 backdrop-blur-md">

            <div className="px-4 py-2 border-2 border-purple-500 outline outline-2 outline-offset-4 outline-purple-500/50">
                <h1 className="flex text-5xl font-bold tracking-tight">
                    <span className="text-blue-500">Musical</span>
                    <span className="text-white">Stats</span>
                
                    <BarraBusca />

                </h1>
                
             </div>

        </nav>

    );

}