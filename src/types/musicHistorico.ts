import type { RowDataPacket } from "mysql2";

export type MusicaHistorico = {
  id_video: string;
  views: number;
  likes: number;
  comentarios: number;
  capturado_em: Date | null;
};

export type MusicaHistoricoRow = MusicaHistorico & RowDataPacket;
