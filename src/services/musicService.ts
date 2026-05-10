import { getAllMusic } from "@/lib/queries/music";
import { getHistory } from "@/lib/queries/history";
import { getMusicById } from "@/lib/queries/music";

export async function getMusicPage(id: string) {
  const music = await getMusicById(id);
  const history = await getHistory(id);

  return {
    music,
    history,
  };
}