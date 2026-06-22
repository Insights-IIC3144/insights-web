export function getOpportunity(c: {
  priceGapPct: number;
  salesSharePct: number;
  averageBrandPrice?: number;
  averageBenchmarkPrice?: number;
}): string {
  const { priceGapPct, salesSharePct } = c;

  if (priceGapPct > 20) return "Precio muy sobre benchmark, oportunidad de margen";
  if (priceGapPct > 10) return "Precio sobre benchmark, oportunidad de margen";
  if (priceGapPct > 5) return "Precio levemente sobre benchmark, evaluar ajuste";
  if (priceGapPct < -20) return "Precio muy bajo benchmark, evaluar posicionamiento";
  if (priceGapPct < -10) return "Precio bajo benchmark, evaluar estrategia de precios";
  if (priceGapPct < -5) return "Precio levemente bajo benchmark, monitorear margen";

  if (salesSharePct < 2) return "Share muy bajo, oportunidad de crecimiento en surtido";
  if (salesSharePct < 5) return "Baja participación, evaluar surtido y visibilidad";
  if (salesSharePct < 10) return "Participación moderada, oportunidad de crecimiento";
  if (salesSharePct >= 10 && salesSharePct < 25) return "Posición competitiva estable, mantener estrategia";

  return "No se ha podido generar una recomendación en este momento";
}
