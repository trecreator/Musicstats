'use client'; // Permite o uso de estado (useState)

import { useState } from 'react';
import { FiltrarMusicaPorTitulo } from '@/app/actions/searchMusic'; // Importa a função de busca do servidor
import CardVideo from './CardVideo';

// Definimos o que o painel precisa receber do servidor ao carregar a página
interface PainelMusicasProps {
  musicasIniciais: any[];
}

export default function PainelMusicas({ musicasIniciais }: PainelMusicasProps) {
  // O estado que armazena a lista viva de músicas exibidas na tela
  const [listagem, setListagem] = useState<any[]>(musicasIniciais);

  // Função interna que intercepta o que o usuário digita
  async function lidarComAEstoque(termo: string) {
    if (!termo.trim()) {
      // Se a barra for esvaziada, volta para a lista padrão inicial
      setListagem(musicasIniciais);
      return;
    }

     async function Filtrar(termo: string) {
    const resultadoFiltrado = await FiltrarMusicaPorTitulo(termo);
    // Atualiza o estado, forçando o React a redesenhar apenas os novos cards
    setListagem(resultadoFiltrado);
      }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 
  
      */}
     

      
      {/* O contêiner vertical dos cards */}
    <div className="flex flex-col">
      {listagem.map((musica) => (
        <CardVideo key={musica.id_video} musica={musica} />
      ))}
    </div>
  </div>
  );
}
