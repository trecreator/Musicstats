import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { registrarVisitaMusica } from "@/app/actions/searchMusic";

export async function POST(request: Request) {
  const { id } = await request.json();
  const cabecalhos = await headers();
  const ipUsuario = cabecalhos.get("x-forwarded-for")?.split(",")[0] || cabecalhos.get("x-real-ip") || "127.0.0.1";
  
  // Registra no banco de dados em segundo plano
  await registrarVisitaMusica(id, ipUsuario);
  return NextResponse.json({ ok: true });
}
