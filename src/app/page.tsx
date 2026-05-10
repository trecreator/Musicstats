import { getHomeData } from "@/lib/queries/music";
import HomeClient from "@/app/_components/home/HomeClient";

export default async function Page() {
  const data = await getHomeData();

  return <HomeClient initialData={data} />;
}