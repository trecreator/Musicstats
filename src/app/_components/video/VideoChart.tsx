"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function VideoChart({ history }: any) {
  const data = history.map((h: any) => ({
    date: h.capturado_em,
    views: h.views,
  }));

  return (
    <div className="bg-zinc-900 p-4 rounded h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>

          <XAxis dataKey="date" />
          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="views"
            stroke="#3b82f6"
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}