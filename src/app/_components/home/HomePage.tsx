"use client";

import { useState, useTransition } from "react";
import { searchMusicAction } from "@/app/actions/searchMusic";

export default function SearchBar({ setData }: any) {
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleChange(e: any) {
    const q = e.target.value;
    setValue(q);

    startTransition(async () => {
      if (!q) return;

      const result = await searchMusicAction(q);
      setData(result);
    });
  }

  return (
    <div className="mb-4">
      <input
        value={value}
        onChange={handleChange}
        placeholder="Search music..."
        className="w-full p-2 bg-zinc-900 text-white rounded"
      />
    </div>
  );
}