import type { RowDataPacket } from "mysql2";

export type Musica = {
  id_video: string;
  titulo: string | null;
  url_video: string | null;
  views: number;
  likes: number;
  comentarios: number;
  published_at: Date | null;
  thumbnail: string | null;
  ultima_atualizacao: Date | null;
  visits: number;
};

export function CalcularIdadeMusica(published_at: Date | null): string
{

  let idade: string = "Recently Added";
  const hoje: Date = new Date();

  if(published_at)
  {

    const diffTime: number = Math.abs(hoje.getTime() - published_at.getTime());
    const diffDays: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const diffYears: number = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));

    if (diffYears > 0) {
      idade = `${diffYears}Y`;
    } else if (diffMonths > 0) {
      idade = `${diffMonths}M`;
    } else {
      idade = `${diffDays}D`;
    }

  }
  return idade;
}

export type MusicaRow = Musica & RowDataPacket;
