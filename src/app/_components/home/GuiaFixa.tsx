'use client';

import { Suspense } from "react";
import BarraBusca from "./BarraDePesquisaMusicas";
import React from "react";
import { InfoPageButton } from "./InfoPageButton";
import { InfoPageYoutubeButton }  from "./InfoPageYotubeButton";
import { UpdatesButton } from "./UpdatesButton";
import Link from "next/link";

export default function GuiaFixa() {
    return (
        <nav className="fixed top-0 z-50 w-full p-4 border-b rounded border-white/20 backdrop-blur-md overflow-hidden">
            {/* Camada isolada para o fundo: aplica a opacidade de 25% sem afetar os filhos */}
            <div className="absolute inset-0 -z-10 bg-[var(--nav-bg,theme(colors.purple.900))] opacity-25" />

            {/* Conteúdo principal com z-index para ficar acima do fundo isolado */}
            <div className="relative z-10 px-4 py-2 border-2 border-purple-500 rounded outline outline-2 outline-offset-4 outline-purple-500/50">
                {/* 
                  Mudamos a estrutura para flex-col no mobile e flex-row no desktop, 
                  garantindo que os elementos fiquem alinhados verticalmente ao centro 
                */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* Bloco do Título + Botão de Informações */}
                    <div className="flex flex-wrap items-center gap-4">
                        <Link href="/" className="">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center">
                                <span className="text-blue-500">Musical</span>
                                <span className="text-white">Stats</span>
                            </h1>
                        </Link>

                        {/* O botão agora fica ao lado do título com tamanho controlado e não herda o 5xl */}
                        <div className="text-sm">
                            <InfoPageButton />
                        </div>

                        <div className="text-sm">
                            <InfoPageYoutubeButton />
                        </div>

                        <div className="text-sm">
                            <UpdatesButton />
                        </div>
                    </div>

                    <div className="flex-1 md:flex-initial md:max-w-md w-full md:ml-auto md:mr-1">
                        <Suspense fallback={<div className="text-white/50 text-sm">Loading search...</div>}>
                            <BarraBusca />
                        </Suspense>
                    </div>

                </div>
             </div>
        </nav>
    );
}
