import Link from 'next/link';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

function formatarNumero(
  num: number
): string {
  if (num >= 1000000000) {
    return (
      (num / 1000000000).toFixed(2) +
      'B'
    );
  }

  if (num >= 1000000) {
    return (
      (num / 1000000).toFixed(2) + 'M'
    );
  }

  if (num >= 1000) {
    return (
      (num / 1000).toFixed(1) + 'K'
    );
  }

  return num.toString();
}

function calcularIdade(
  dataISO: string | null
) {
  if (!dataISO) {
    return 'Data N/A';
  }

  const pub = new Date(dataISO);

  const hoje = new Date();

  const diff =
    hoje.getTime() - pub.getTime();

  const dias = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  if (dias >= 365) {
    return (
      (dias / 365).toFixed(1) +
      ' anos'
    );
  }

  return `${dias} dias`;
}

export default async function VideoPage({
  params,
}: Props) {

  const { id: videoId } =
    await params;

  /* =========================================
     DADOS LOCAIS
  ========================================= */

  const [rows]: any = await pool.query(
    `
    SELECT
      id_video,
      titulo,
      tags,
      tag_color
    FROM musicas
    WHERE id_video = ?
    LIMIT 1
    `,
    [videoId]
  );

  const musica = rows[0];

  if (!musica) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">
            Vídeo não encontrado
          </h1>

          <Link
            href="/"
            className="text-blue-500 hover:underline"
          >
            Voltar para o ranking
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================
     STATS ATUAIS
  ========================================= */

  const [statsRows]: any = await pool.query(
  `
  SELECT *
  FROM musicas_historico
  WHERE id_video = ?
  ORDER BY capturado_em DESC
  LIMIT 1
  `,
  [videoId]
);

const stats = statsRows[0];

const [previousRows]: any = await pool.query(
  `
  SELECT views
  FROM musicas_historico
  WHERE id_video = ?
  ORDER BY capturado_em DESC
  LIMIT 2
  `,
  [videoId]
);

let yesterdayViews = null;
let deltaViews = null;

if (previousRows.length >= 2) {
  const today = Number(previousRows[0].views);
  const yesterday = Number(previousRows[1].views);

  yesterdayViews = yesterday;
  deltaViews = today - yesterday;
}

  if (!stats) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">
            Falha ao carregar vídeo
          </h1>

          <Link
            href="/"
            className="text-blue-500 hover:underline"
          >
            Voltar para o ranking
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================
     HISTÓRICO
  ========================================= */

  const [historico]: any =
    await pool.query(
      `
      SELECT
        views,
        likes,
        comentarios,
        capturado_em
      FROM musicas_historico
      WHERE id_video = ?
      ORDER BY capturado_em DESC
      LIMIT 20
      `,
      [videoId]
    );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#bbb] p-4 md:p-8 font-sans text-[11px]">
      <div className="max-w-[1400px] mx-auto">

        {/* =========================================
            TOPO
        ========================================= */}

        <div className="flex items-center justify-between border border-[#222] bg-[#111] p-4 mb-6">
          <div>
            <Link
              href="/"
              className="text-blue-500 hover:underline uppercase text-[10px]"
            >
              ← Voltar ao ranking
            </Link>

            <h1 className="text-white text-2xl md:text-4xl font-black uppercase italic mt-3 leading-tight">
              {musica.titulo}
            </h1>
          </div>

          <a
            href={`https://youtube.com/watch?v=${videoId}`}
            target="_blank"
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 font-bold uppercase transition-colors"
          >
            YouTube
          </a>
        </div>

        {/* =========================================
            CONTEÚDO
        ========================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

          {/* =========================================
              ESQUERDA
          ========================================= */}

          <div className="space-y-6">

            {/* PLAYER / THUMB */}

            <div className="border border-[#222] bg-black overflow-hidden">
              <img
                src={stats.thumbnail}
                alt={musica.titulo}
                className="w-full aspect-video object-contain"
              />
            </div>

            {/* STATS */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-[#111] border border-[#222] p-4">
                <span className="text-[#555] uppercase block mb-2 font-bold">
                  Views
                </span>

                <span className="text-white text-2xl font-black font-mono">
                  {stats.views.toLocaleString(
                    'pt-BR'
                  )}
                </span>
              </div>

              <div className="bg-[#111] border border-[#222] p-4">
                <span className="text-[#555] uppercase block mb-2 font-bold">
                  Likes
                </span>

                <span className="text-blue-500 text-2xl font-black font-mono">
                  {stats.likes.toLocaleString(
                    'pt-BR'
                  )}
                </span>
              </div>
                              <div className="bg-[#111] border border-[#222] p-4">
                <span className="text-[#555] uppercase block mb-2 font-bold">
                  Comments
                </span>

                <span className="text-green-500 text-2xl font-black font-mono">
                  {stats.comments.toLocaleString(
                    'pt-BR'
                  )}
                </span>
              </div>

              <div className="bg-[#111] border border-[#222] p-4">
                <span className="text-[#555] uppercase block mb-2 font-bold">
                  Age
                </span>

                <span className="text-yellow-500 text-2xl font-black font-mono">
                  {calcularIdade(
                    stats.publishedAt
                  )}
                </span>
              </div>
            </div>

            {/* TAGS */}

            <div className="bg-[#111] border border-[#222] p-4">
              <h2 className="text-white uppercase font-black mb-4 text-sm">
                Tags
              </h2>

              <div className="flex flex-wrap gap-2">
                {musica.tags
                  ?.split(',')
                  .map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        color:
                          musica.tag_color,

                        borderColor:
                          musica.tag_color,
                      }}
                      className="border px-3 py-1 rounded-full text-[10px] font-black uppercase"
                    >
                      {tag.trim()}
                    </span>
                  ))}
              </div>
            </div>

            {/* HISTÓRICO */}

            <div className="bg-[#111] border border-[#222] overflow-hidden">
              <div className="p-4 border-b border-[#222]">
                <h2 className="text-white uppercase font-black text-sm">
                  Histórico de Métricas
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">

                  <thead>
                    <tr className="bg-black text-[#555] uppercase text-[10px]">

                      <th className="p-3 text-left border-b border-[#222]">
                        Capturado em
                      </th>

                      <th className="p-3 text-right border-b border-[#222]">
                        Views
                      </th>

                      <th className="p-3 text-right border-b border-[#222]">
                        Likes
                      </th>

                      <th className="p-3 text-right border-b border-[#222]">
                        Comments
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {historico.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-6 text-center text-[#555]"
                        >
                          Nenhum snapshot encontrado ainda.
                        </td>
                      </tr>
                    )}

                    {historico.map(
                      (
                        item: any,
                        index: number
                      ) => (
                        <tr
                          key={index}
                          className="hover:bg-[#151515] border-b border-[#1a1a1a]"
                        >

                          <td className="p-3 font-mono text-[#777]">
                            {new Date(
                              item.capturado_em
                            ).toLocaleString(
                              'pt-BR'
                            )}
                          </td>

                          <td className="p-3 text-right font-mono text-white">
  {Number(
    item.views
  ).toLocaleString('pt-BR')}
</td>

<td className="p-3 text-right font-mono text-blue-500">
  {Number(
    item.likes
  ).toLocaleString('pt-BR')}
</td>

<td className="p-3 text-right font-mono text-green-500">
  {Number(
    item.comentarios
  ).toLocaleString('pt-BR')}
</td>

                        </tr>
                      )
                    )}

                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* =========================================
              SIDEBAR
          ========================================= */}

          <div className="space-y-6">

            {/* RESUMO */}

            <div>
  <span className="text-[#555] uppercase block mb-1">
    Views Yesterday
  </span>

  <span className="text-white font-black text-lg font-mono">
    {yesterdayViews?.toLocaleString('pt-BR') ?? 'N/A'}
  </span>
</div>

<div>
  <span className="text-[#555] uppercase block mb-1">
    Change (24h)
  </span>

  <span
    className={
      (deltaViews ?? 0) >= 0
        ? 'text-green-500 font-black text-lg font-mono'
        : 'text-red-500 font-black text-lg font-mono'
    }
  >
    {deltaViews !== null
      ? (deltaViews > 0 ? '+' : '') + deltaViews.toLocaleString('pt-BR')
      : 'N/A'}
  </span>
</div>

            <div className="bg-[#111] border border-[#222] p-5">
              <h2 className="text-white uppercase font-black text-sm mb-5">
                Resumo Técnico
              </h2>

              <div className="space-y-4">

                <div>
                  <span className="text-[#555] uppercase block mb-1">
                    Video ID
                  </span>

                  <span className="text-white font-mono break-all">
                    {videoId}
                  </span>
                </div>

                <div>
                  <span className="text-[#555] uppercase block mb-1">
                    Views Compactadas
                  </span>

                  <span className="text-blue-500 font-black text-xl font-mono">
  {stats.views.toLocaleString(
    'pt-BR'
  )}
</span>
                </div>

                <div>
                  <span className="text-[#555] uppercase block mb-1">
                    Publicado em
                  </span>

                  <span className="text-white font-mono">
                    {stats.publishedAt
                      ? new Date(
                          stats.publishedAt
                        ).toLocaleDateString(
                          'pt-BR'
                        )
                      : 'N/A'}
                  </span>
                </div>

              </div>
            </div>

            {/* PLACEHOLDER GRÁFICOS */}

            <div className="bg-[#111] border border-[#222] p-5">
              <h2 className="text-white uppercase font-black text-sm mb-4">
                Projeção / Gráfico
              </h2>

              <div className="h-[250px] border border-dashed border-[#333] flex items-center justify-center text-[#444] uppercase text-[10px] text-center px-6">
                Sistema de gráficos será
                conectado após o updater
                automático de snapshots.
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}