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
      />
      <KpiCard
        label="Unidades share"
        value={fmtPct(kpis?.overallVolumeShare ?? 0)}
        icon={<Activity className="h-4 w-4" />}
      />
      <KpiCard
        label="Precio promedio marca"
        value={fmtMoney(kpis?.avgPriceBrand ?? 0)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <KpiCard
        label="Δ vs precio benchmark"
        value={fmtPct(kpis?.priceGapPct ?? 0)}
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}