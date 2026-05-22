interface PredictionResult {
  success: boolean;
  message?: string;

  milestone?: number;
  predictedDate?: Date;
  averageDailyGain?: number;
  remainingViews?: number;
  remainingDays?: number;
}

interface HistoricoItem {
  views: number;
  capturado_em: string | Date;
}

export function calcularPrevisaoViews(
  viewsAtuais: number,
  historico: HistoricoItem[]
): PredictionResult {

  // Precisa de pelo menos 4 snapshots
  if (!historico || historico.length < 4) {
    return {
      success: false,
      message: "Cannot estimate due to insufficient historical data.",
    };
  }

  // Ordena do mais antigo para o mais recente
  const ordenado = [...historico].sort(
    (a, b) =>
      new Date(a.capturado_em).getTime() -
      new Date(b.capturado_em).getTime()
  );

  // Calcula ganhos diários reais
  const ganhosDiarios: number[] = [];

  for (let i = 1; i < ordenado.length; i++) {

    const ganho = ordenado[i].views - ordenado[i - 1].views;

    // Ignora valores inválidos
    if (ganho > 0) {
      ganhosDiarios.push(ganho);
    }
  }

  // Precisa de pelo menos 3 ganhos válidos
  if (ganhosDiarios.length < 3) {
    return {
      success: false,
      message: "Cannot estimate due to insufficient historical data.",
    };
  }

  // Usa apenas os últimos 7 ganhos
  const ultimosGanhos = ganhosDiarios.slice(-7);

  // Remove outliers extremos
  const ganhosOrdenados = [...ultimosGanhos].sort((a, b) => a - b);

  const corteInferior = Math.floor(ganhosOrdenados.length * 0.15);
  const corteSuperior = Math.ceil(ganhosOrdenados.length * 0.85);

  const ganhosFiltrados = ganhosOrdenados.slice(
    corteInferior,
    corteSuperior
  );

  // Segurança extra
  if (ganhosFiltrados.length === 0) {
    return {
      success: false,
      message: "Cannot estimate due to unstable historical growth.",
    };
  }

  // Média suavizada
  const mediaDiaria =
    ganhosFiltrados.reduce((acc, n) => acc + n, 0) /
    ganhosFiltrados.length;

  // Growth muito baixo
  if (mediaDiaria < 1000) {
    return {
      success: false,
      message: "Cannot estimate due to low daily growth.",
    };
  }

  // Próximo milestone estilo Kworb
  const milestone = calcularProximoMilestone(viewsAtuais);

  const remainingViews = milestone - viewsAtuais;

  if (remainingViews <= 0) {
    return {
      success: false,
      message: "Cannot estimate a realistic milestone date.",
    };
  }

  const remainingDays = Math.ceil(remainingViews / mediaDiaria);

  // Limite de previsão
  if (remainingDays > 1825) {
    return {
      success: false,
      message: "Cannot estimate a realistic milestone date.",
    };
  }

  const predictedDate = new Date();

  predictedDate.setDate(
    predictedDate.getDate() + remainingDays
  );

  return {
    success: true,
    milestone,
    predictedDate,
    averageDailyGain: Math.round(mediaDiaria),
    remainingViews,
    remainingDays,
  };
}

function calcularProximoMilestone(views: number): number {

  if (views < 1_000_000) {
    return Math.ceil(views / 100_000) * 100_000;
  }

  if (views < 10_000_000) {
    return Math.ceil(views / 1_000_000) * 1_000_000;
  }

  if (views < 100_000_000) {
    return Math.ceil(views / 10_000_000) * 10_000_000;
  }

  if (views < 1_000_000_000) {
    return Math.ceil(views / 100_000_000) * 100_000_000;
  }

  return Math.ceil(views / 500_000_000) * 500_000_000;
}