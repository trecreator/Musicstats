import type { RowDataPacket } from "mysql2";

export type Musica = {
  id_video: string;
  titulo: string | null;
  url_video: string | null;
  views: number;
  likes: number;
  comentarios: number;
  published_at: Date | string | null;
  thumbnail: string | null;
  ultima_atualizacao: Date | string | null;
  visits: number;
};

export function CalcularIdadeMusica(published_at: Date | string | null): string
{
  if (!published_at) {
    return "Recently Added";
  }

  const dataPublicacao = new Date(
    typeof published_at === "string"
      ? published_at.replace(" ", "T")
      : published_at
  );

  if (isNaN(dataPublicacao.getTime())) {
    return "Recently Added";
  }

  const hoje = new Date();

  const diffTime = hoje.getTime() - dataPublicacao.getTime();

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears >= 1) {
    return `${diffYears}Y`;
  }

  if (diffMonths >= 1) {
    return `${diffMonths}M`;
  }

  return `${Math.max(diffDays, 0)}D`;
}

export type MusicaRow = Musica & RowDataPacket;
