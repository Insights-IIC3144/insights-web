import { Target, Activity, DollarSign, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtMoney, fmtPct } from "@/lib/format";

interface CompetitiveKpis {
  overallSalesShare: number;
  overallVolumeShare: number;
  avgPriceBrand: number;
  priceGapPct: number;
}

interface Props {
  kpis: CompetitiveKpis | null;
  loading: boolean;
}

export function CompetitiveKpiGrid({ kpis, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <KpiCard
        label="Share de ventas"
        value={fmtPct(kpis?.overallSalesShare ?? 0)}
        icon={<Target className="h-4 w-4" />}
        tooltip="Participación de mercado en valor monetario. Representa los ingresos de la marca como porcentaje del total vendido en dinero dentro de sus categorías."
      />
      <KpiCard
        label="Unidades share"
        value={fmtPct(kpis?.overallVolumeShare ?? 0)}
        icon={<Activity className="h-4 w-4" />}
        tooltip="Participación de mercado en volumen. Representa el total de unidades físicas vendidas por la marca como porcentaje del total de unidades de las categorías."
      />
      <KpiCard
        label="Precio promedio marca"
        value={fmtMoney(kpis?.avgPriceBrand ?? 0)}
        icon={<DollarSign className="h-4 w-4" />}
        tooltip="Precio de venta unitario promedio de la marca. Se calcula dividiendo los ingresos totales recaudados entre el volumen total de unidades vendidas."
      />
      <KpiCard
        label="Δ Precio benchmark"
        value={fmtPct(kpis?.priceGapPct ?? 0)}
        icon={<TrendingUp className="h-4 w-4" />}
        tooltip="Brecha de precio frente a la competencia. Muestra porcentualmente qué tan caro o barato es el precio promedio de la marca en comparación con el promedio ponderado del resto de los productos en las categorías."
      />
    </div>
  );
}