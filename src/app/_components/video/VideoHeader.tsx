export default function VideoHeader({ music }: any) {
  return (
    <div className="flex gap-4 items-center">

      <img
        src={music.thumbnail}
        className="w-24 h-24 rounded"
      />

      <div>
        <h1 className="text-xl font-bold">{music.titulo}</h1>

        <a
          href={music.url_video}
          target="_blank"
          className="text-blue-400 text-sm"
        >
          Open on YouTube
        </a>
      </div>

    </div>
  );
}