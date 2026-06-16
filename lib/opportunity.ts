export function getOpportunity(c: { priceGapPct: number; salesSharePct: number }): string {
  // TODO: make this fallback more robust, consider multiple metrics and create more specific insights
  if (c.priceGapPct > 10) return "Precio sobre benchmark, oportunidad de margen";
  if (c.priceGapPct < -10) return "Precio bajo benchmark, evaluar estrategia de precios";
  if (c.salesSharePct < 5) return "Baja participación, evaluar surtido";
  return "No se cuenta con un insight en este momento";
}
