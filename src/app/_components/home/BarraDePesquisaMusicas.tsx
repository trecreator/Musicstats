'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function BarraBusca() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(termo: string) {
    // Cria uma cópia dos parâmetros atuais da URL
    const params = new URLSearchParams(searchParams.toString());
    
    if (termo.trim()) {
      params.set('busca', termo); // Se digitou algo, adiciona ?busca=termo
    } else {
      params.delete('busca'); // Se apagou, limpa a URL
    }

    // Atualiza a URL do navegador em tempo real sem recarregar a página inteira
    router.push(`/?${params.toString()}`);
  }

  return (
    <span className="flex items-center ml-auto">
      <input
        type="text"
        placeholder="Search music by title..."
        // Usa o valor atual da URL para o input não apagar sozinho se a página atualizar
        defaultValue={searchParams.get('busca') ?? ''}
        className="flex mr-[0px] w-[300px] items-center text-left px-2 bg-purple-900/35 border-2 border-white/20 rounded left-10 py-1 text-sm text-white/85 tracking-[1px] caret-purple-500/85 outline-none focus:border-purple-500/35 placeholder:tracking-normal text-white/60 font-light
        holver: border-purple-500/35 transition-colors duration-200"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </span>
  );
}