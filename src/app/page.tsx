'use client';
export const dynamic = 'force-dynamic';


import {
  useState,
  useEffect,
  useMemo,
} from 'react';

import Link from 'next/link';

import {
  cadastrarMusica,
  buscarMusicasMonitoradas,
} from './actions';

interface Musica {
  id_video: string;

  titulo: string;

  tags: string;

  tag_color: string;

  views: number;

  likes: number;

  comentarios: number;

  idade: string;

  idadeDias: number;

  thumbnail: string;

  trend: 'up' | 'down' | 'stable';

  trendPercent: number;

  trendDelta: number;
}

export default function Home() {
  const [url, setUrl] =
    useState('');

  const [status, setStatus] =
    useState('');

  const [catalogo, setCatalogo] =
    useState<Musica[]>([]);

  const [busca, setBusca] =
    useState('');

  const [ordem, setOrdem] =
    useState<{
      campo: string;
      asc: boolean;
    }>({
      campo: 'views',
      asc: false,
    });

  const [carregando, setCarregando] =
    useState(true);

  async function carregarDados() {
    try {
      setCarregando(true);

      const res =
        await buscarMusicasMonitoradas();

      if (res.success) {
        setCatalogo(
          res.dados as Musica[]
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const catalogoFiltrado =
    useMemo(() => {
      const lista = [...catalogo];

      const filtrado =
        lista.filter((m) =>
          m.titulo
            ?.toLowerCase()
            .includes(
              busca.toLowerCase()
            )
        );

      filtrado.sort((a, b) => {
        let valA: any =
          a[
            ordem.campo as keyof Musica
          ];

        let valB: any =
          b[
            ordem.campo as keyof Musica
          ];

        /*
          NÚMEROS
        */
        if (
          ordem.campo ===
            'views' ||
          ordem.campo ===
            'likes' ||
          ordem.campo ===
            'comentarios' ||
          ordem.campo ===
            'idadeDias'   ||
          ordem.campo ===
           'trendPercent' ||
           ordem.campo === 
           'trendDelta'

        ) {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        }

        if (valA < valB) {
          return ordem.asc
            ? -1
            : 1;
        }

        if (valA > valB) {
          return ordem.asc
            ? 1
            : -1;
        }

        return 0;
      });

      return filtrado;
    }, [
      catalogo,
      busca,
      ordem,
    ]);

  function toggleOrdem(campo: string) {
  setOrdem((prev) => ({
    campo,
    asc: campo === 'trendPercent' ? false :
         prev.campo === campo ? !prev.asc : false,
  }));
}

  async function handlePedido() {
    if (!url) {
      return;
    }

    try {
      setStatus('...');

      const res =
        await cadastrarMusica(url);

      if (res.success) {
        setStatus('OK');

        setUrl('');

        carregarDados();
      } else {
        setStatus('ERRO');
      }
    } catch {
      setStatus('ERRO');
    }

    setTimeout(() => {
      setStatus('');
    }, 2000);
  }

  function formatarNumero(
    num: number
  ) {
    if (num >= 1000000000) {
      return (
        (
          num / 1000000000
        ).toFixed(2) + 'B'
      );
    }

    if (num >= 1000000) {
      return (
        (
          num / 1000000
        ).toFixed(2) + 'M'
      );
    }

    if (num >= 1000) {
      return (
        (
          num / 1000
        ).toFixed(1) + 'K'
      );
    }

    return num.toString();
  }

  if (carregando) {
    return (
      <div className="bg-black min-h-screen text-blue-500 p-10 font-mono text-xs uppercase animate-pulse">
        Carregando banco de dados...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#bbb] font-sans text-[11px] p-2 md:p-8">

      <div className="max-w-[1400px] mx-auto">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between mb-6 bg-[#151515] p-4 border border-[#222]">

          <div className="flex flex-col md:flex-row gap-3 md:items-center">

            <h1 className="text-white font-black text-xl tracking-tighter uppercase italic">
              Musical
              <span className="text-blue-600">
                Stats
              </span>
            </h1>

            <input
              type="text"
              placeholder="Pesquisar música..."
              value={busca}
              onChange={(e) =>
                setBusca(
                  e.target.value
                )
              }
              className="
                bg-black
                border
                border-[#333]
                px-3
                py-2
                text-white
                outline-none
                focus:border-blue-700
                w-full
                md:w-72
              "
            />
          </div>

          <div className="flex flex-col md:flex-row gap-2">

            <Link
              href="/pedidos"
              className="
                bg-[#222]
                hover:bg-[#333]
                text-white
                px-4
                py-2
                font-bold
                uppercase
                text-center
                transition-colors
              "
            >
              Top Requests
            </Link>

            <input
              type="text"
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              placeholder="URL ou ID YouTube"
              className="
                bg-black
                border
                border-[#333]
                px-3
                py-2
                text-white
                outline-none
              "
            />

            <button
              onClick={
                handlePedido
              }
              className="
                bg-blue-700
                hover:bg-blue-600
                text-white
                px-4
                py-2
                font-bold
                uppercase
                transition-colors
              "
            >
              Pedir {status}
            </button>

            <button
             onClick={() => toggleOrdem('trendPercent')}
             className="
              bg-[#222]
              hover:bg-[#333]
              text-white
              px-4
              py-2
              font-bold
              uppercase
              transition-colors
              "
              >
              Trend {ordem.campo === 'trendPercent' && (ordem.asc ? '▲' : '▼')}
            </button>
          </div>
        </div>

        {/* =========================================
            TABELA
        ========================================= */}

        <div className="overflow-x-auto border border-[#181818]">
          <table className="w-full border-collapse min-w-[1000px]">

            <thead>
              <tr className="bg-[#111] text-left text-[#666] uppercase">

                <th className="p-3 border border-[#181818] w-14 text-center">
                  #
                </th>

                <th className="p-3 border border-[#181818]">
                  Track / Artist
                </th>

                <th className="p-3 border border-[#181818] text-right">
                  Tags
                </th>

                <th
                  onClick={() =>
                    toggleOrdem(
                      'views'
                    )
                  }
                  className="
                    p-3
                    border
                    border-[#181818]
                    text-right
                    cursor-pointer
                    hover:text-white
                  "
                >
                  Views{' '}
                  {ordem.campo ===
                    'views' &&
                    (ordem.asc
                      ? '▲'
                      : '▼')}
                </th>

                <th
                  onClick={() =>
                    toggleOrdem(
                      'likes'
                    )
                  }
                  className="
                    p-3
                    border
                    border-[#181818]
                    text-right
                    cursor-pointer
                    hover:text-white
                  "
                >
                  Likes{' '}
                  {ordem.campo ===
                    'likes' &&
                    (ordem.asc
                      ? '▲'
                      : '▼')}
                </th>
                                <th
                  onClick={() =>
                    toggleOrdem(
                      'comentarios'
                    )
                  }
                  className="
                    p-3
                    border
                    border-[#181818]
                    text-right
                    cursor-pointer
                    hover:text-white
                  "
                >
                  Comments{' '}
                  {ordem.campo ===
                    'comentarios' &&
                    (ordem.asc
                      ? '▲'
                      : '▼')}
                </th>

                <th
                  onClick={() =>
                    toggleOrdem(
                      'idadeDias'
                    )
                  }
                  className="
                    p-3
                    border
                    border-[#181818]
                    text-right
                    cursor-pointer
                    hover:text-white
                  "
                >
                  Age{' '}
                  {ordem.campo ===
                    'idadeDias' &&
                    (ordem.asc
                      ? '▲'
                      : '▼')}
                </th>

                      <th className="p-3 border border-[#181818] text-right">
                  Trend
                </th>
                      
              </tr>
            </thead>

            <tbody>

              {catalogoFiltrado.map(
                (m, i) => (
                  <tr
                    key={m.id_video}
                    className="
                      hover:bg-[#151515]
                      transition-colors
                      border-b
                      border-[#111]
                    "
                  >

                    <td className="p-3 text-center border-r border-[#181818] text-[#444] font-mono">
                      {i + 1}
                    </td>

                    <td className="p-3">

                      <Link
                        href={`/video/${m.id_video}`}
                        className="
                          text-blue-500
                          hover:text-blue-400
                          hover:underline
                          font-bold
                          uppercase
                          transition-colors
                        "
                      >
                        {m.titulo}
                      </Link>

                    </td>

                    <td className="p-3 text-right">

                      <div className="flex flex-wrap justify-end gap-1">

                        {m.tags
                          ?.split(',')
                          .filter(
                            (tag) =>
                              tag.trim()
                          )
                          .map(
                            (
                              t: string
                            ) => (
                              <span
                                key={t}
                                style={{
                                  backgroundColor:
                                    m.tag_color,
                                }}
                                className="
                                  text-white
                                  text-[9px]
                                  px-3
                                  py-1
                                  rounded-full
                                  font-black
                                  uppercase
                                  tracking-tight
                                  shadow-md
                                "
                              >
                                {t.trim()}
                              </span>
                            )
                          )}

                      </div>

                    </td>

                    <td className="p-3 text-right font-mono text-white">
                      {formatarNumero(
                        m.views
                      )}
                    </td>

                    <td className="p-3 text-right font-mono text-blue-500">
                      {formatarNumero(
                        m.likes
                      )}
                    </td>

                    <td className="p-3 text-right font-mono text-green-500">
                      {formatarNumero(
                        m.comentarios
                      )}
                    </td>

                    <td className="p-3 text-right font-mono text-[#666] italic">
                      {m.idade}
                    </td>
                      <td className="p-3 text-right font-mono">
  {m.trend === 'up' && (
    <span className="text-green-500 font-bold">
      ▲ {m.trendPercent.toFixed(2)}%
    </span>
  )}

  {m.trend === 'down' && (
    <span className="text-red-500 font-bold">
      ▼ {Math.abs(m.trendPercent).toFixed(2)}%
    </span>
  )}

  {m.trend === 'stable' && (
    <span className="text-[#666]">
      —
    </span>
  )}
</td>
                  </tr>
                )
              )}
              
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}