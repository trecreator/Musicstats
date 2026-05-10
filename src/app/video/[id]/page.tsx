import Link from 'next/link';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

/* =========================================
   FORMATADORES
========================================= */

function formatarNumero(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function calcularIdade(dataISO: string | null) {
  if (!dataISO) return 'Data N/A';

  const pub = new Date(dataISO);
  const hoje = new Date();

  const diff = hoje.getTime() - pub.getTime();
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (dias >= 365) return (dias / 365).toFixed(1) + ' anos';
  return `${dias} dias`;
}

/* =========================================
   PAGE
========================================= */

export default async function VideoPage({ params }: Props) {
  const { id: videoId } = await params;

  /* =========================================
     MÚSICA BASE
  ========================================= */

  const [rows]: any = await pool.query(
    `
    SELECT id_video, titulo, tags, tag_color
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
        Vídeo não encontrado
      </main>
    );
  }

  /* =========================================
     ÚLTIMO SNAPSHOT
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

  const stats = statsRows?.[0] ?? null;

  if (!stats || !stats.views)  {

    const safeStats = stats ?? {
  views: 0,
  likes: 0,
  comments: 0,
  publishedAt: null,
  thumbnail: '',
};

    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Sem dados históricos ainda
      </main>
    );
  }

  /* =========================================
     DELTA 24H
  ========================================= */

  const [prevRows]: any = await pool.query(
    `
    SELECT views
    FROM musicas_historico
    WHERE id_video = ?
    ORDER BY capturado_em DESC
    LIMIT 2
    `,
    [videoId]
  );

 let deltaViews: number | null = null;

  if (prevRows.length >= 2) {
    deltaViews =
      Number(prevRows[0].views) -
      Number(prevRows[1].views);
  }

  /* =========================================
     HISTÓRICO
  ========================================= */

  const [historico]: any = await pool.query(
    `
    SELECT views, likes, comentarios, capturado_em
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
            HEADER
        ========================================= */}

        <div className="flex items-center justify-between border border-[#222] bg-[#111] p-4 mb-6">
          <div>
            <Link href="/" className="text-blue-500 hover:underline uppercase text-[10px]">
              ← Voltar ao ranking
            </Link>

            <h1 className="text-white text-2xl md:text-4xl font-black uppercase italic mt-3">
              {musica.titulo}
            </h1>
          </div>

          <a
            href={`https://youtube.com/watch?v=${videoId}`}
            target="_blank"
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 font-bold uppercase"
          >
            YouTube
          </a>
        </div>

        {/* =========================================
            GRID
        ========================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            <img
              src={stats.thumbnail}
              className="w-full aspect-video border border-[#222]"
            />

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-[#111] border border-[#222] p-4">
                Views
                <div className="text-white text-2xl font-black">
                  {formatarNumero(stats.views)}
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-4">
                Likes
                <div className="text-blue-500 text-2xl font-black">
                  {formatarNumero(stats.likes)}
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-4">
                Comments
                <div className="text-green-500 text-2xl font-black">
                  {formatarNumero(stats.comentarios)}
                </div>
              </div>

              <div className="bg-[#111] border border-[#222] p-4">
                Age
                <div className="text-yellow-500 text-2xl font-black">
                  {calcularIdade(stats.publishedAt)}
                </div>
              </div>

            </div>

            {/* TAGS */}
            <div className="bg-[#111] border border-[#222] p-4">
              <h2 className="text-white mb-3">Tags</h2>

              <div className="flex flex-wrap gap-2">
                {musica.tags?.split(',').map((tag: string) => (
                  <span
                    key={tag}
                    style={{ borderColor: musica.tag_color }}
                    className="border px-3 py-1 text-[10px] uppercase"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* HISTÓRICO */}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th>Date</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((h: any, i: number) => (
                  <tr key={i}>
                    <td>{new Date(h.capturado_em).toLocaleString()}</td>
                    <td>{h.views}</td>
                    <td>{h.likes}</td>
                    <td>{h.comentarios}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

          {/* SIDEBAR */}
          <div className="space-y-4">

            {/* TREND (CORRIGIDO NO ACTIONS) */}
            <div className="bg-[#111] border border-[#222] p-4">
              <h2 className="text-white mb-2">Trend</h2>

              <div className={
                stats.trend === 'up'
                  ? 'text-green-500'
                  : stats.trend === 'down'
                  ? 'text-red-500'
                  : 'text-gray-500'
              }>
                {stats.trend === 'up' && '▲ '}
                {stats.trend === 'down' && '▼ '}
                {stats.trendPercent?.toFixed(2)}%
              </div>

              <div className="text-xs text-gray-500">
                Δ {stats.trendDelta}
              </div>
            </div>

            {/* DELTA 24H */}
            <div>
              Δ 24h Views<br />
              <span className={
  (deltaViews ?? 0) >= 0
    ? 'text-green-500'
    : 'text-red-500'
}>
                {deltaViews ?? 'N/A'}
              </span>
            </div>

            <div>
              Video ID<br />
              {videoId}
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}