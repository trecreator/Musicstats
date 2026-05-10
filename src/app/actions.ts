'use server';

import { listarMusicas } from '@/server/services/musicService';

export async function buscarMusicasMonitoradas() {
  try {
    const dados = await listarMusicas();

    return {
      success: true,
      dados,
    };
  } catch (e) {
    return {
      success: false,
      dados: [],
    };
  }
}