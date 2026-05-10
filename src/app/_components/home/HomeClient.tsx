"use client";

import { useState } from "react";
import MusicTable from "./MusicTable";

export default function HomeClient({ initialData }: any) {
  const [musicas, setMusicas] = useState(initialData);

  return (
    <div>
      <MusicTable data={musicas} />
    </div>
  );
}