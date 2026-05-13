import VideoHeader from "./VideoHeader";
import VideoStats from "./VideoStats";
import VideoChart from "./VideoChart";

export default function VideoPage({ data }: any) {
  return (
    <div className="p-6 bg-black min-h-screen text-white space-y-6">

      <VideoHeader music={data.music} />

      <VideoStats data={data} />

      <VideoChart history={data.history} />

    </div>
  );
}