export default function VideoStats({ data }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <Card label="Views" value={data.music.views} />
      <Card label="Likes" value={data.likesFormatted} />
      <Card label="Comments" value={data.commentsFormatted} />

      <Card label="Growth" value={data.growth.toFixed(3)} />

      <Card label="Yesterday" value={data.yesterday} />

      <Card label="Age (years)" value={data.age.toFixed(2)} />

      <Card
        label="100M ETA"
        value={
          data.expected100mDate
            ? data.expected100mDate.toDateString()
            : "N/A"
        }
      />

    </div>
  );
}

function Card({ label, value }: any) {
  return (
    <div className="bg-zinc-900 p-4 rounded">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-white font-bold">{value}</div>
    </div>
  );
}