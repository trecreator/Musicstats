import { isbot } from "isbot";

const FORMATO_ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

interface DadosDaVisita {
  ambiente: string | undefined; // valor de VERCEL_ENV
  userAgent: string | null;
  secFetchSite: string | null;
  id: unknown;
}

// Devolve o motivo para NÃO contar a visita, ou null quando ela pode ser contada.
export function motivoParaIgnorarVisita({
  ambiente,
  userAgent,
  secFetchSite,
  id,
}: DadosDaVisita): string | null {
  // Testes locais usam o mesmo banco da produção e não podem entrar na contagem.
  if (ambiente !== "production") return "ambiente";
  if (typeof id !== "string" || !FORMATO_ID_YOUTUBE.test(id)) return "id";
  if (!userAgent || isbot(userAgent)) return "bot";
  // Navegadores marcam chamadas feitas pelo próprio site; scripts externos não.
  if (secFetchSite !== "same-origin") return "origem";
  return null;
}
