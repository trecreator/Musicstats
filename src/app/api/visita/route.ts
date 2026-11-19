import { NextResponse } from "next/server";
import { motivoParaIgnorarVisita } from "@/services/filtroVisitas";
import { registrarVisitaMusica } from "@/services/visitasService";

const semConteudo = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const motivo = motivoParaIgnorarVisita({
    ambiente: process.env.VERCEL_ENV,
    userAgent: request.headers.get("user-agent"),
    secFetchSite: request.headers.get("sec-fetch-site"),
    id,
  });
  if (motivo) return semConteudo();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip");
  if (!ip) return semConteudo();

  try {
    await registrarVisitaMusica(id as string, ip);
  } catch (erro) {
    // Uma falha na contagem não deve afetar quem está navegando no site.
    console.error("Erro ao registrar visita:", erro);
  }
  return semConteudo();
}
