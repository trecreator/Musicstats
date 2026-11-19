"use client";

import { useEffect } from "react";

const TEMPO_MINIMO_MS = 3000;
const EVENTOS_DE_INTERACAO = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel"] as const;

// Só conta a visita depois de alguns segundos na página e de uma interação real.
// Robôs que apenas carregam a página e executam o JavaScript não chegam a enviar nada.
export default function RegistrarVisita({ id }: { id: string }) {
  useEffect(() => {
    let enviada = false;
    let interagiu = false;
    let tempoCumprido = false;

    const removerOuvintes = () => {
      EVENTOS_DE_INTERACAO.forEach((evento) => window.removeEventListener(evento, aoInteragir));
      document.removeEventListener("visibilitychange", tentarEnviar);
    };

    function tentarEnviar() {
      if (enviada || !interagiu || !tempoCumprido || document.visibilityState !== "visible") return;

      enviada = true;
      removerOuvintes();
      fetch("/api/visita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      }).catch(() => {});
    }

    function aoInteragir(evento: Event) {
      if (!evento.isTrusted) return; // ignora eventos simulados por script
      interagiu = true;
      tentarEnviar();
    }

    const temporizador = setTimeout(() => {
      tempoCumprido = true;
      tentarEnviar();
    }, TEMPO_MINIMO_MS);

    EVENTOS_DE_INTERACAO.forEach((evento) =>
      window.addEventListener(evento, aoInteragir, { passive: true })
    );
    document.addEventListener("visibilitychange", tentarEnviar);

    return () => {
      clearTimeout(temporizador);
      removerOuvintes();
    };
  }, [id]);

  return null;
}
