"use client";

import { Activity, DollarSign, Target, TrendingUp } from "lucide-react";
import { Filters } from "@/components/ui-extra/Filters";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { competitionByCategory } from "@/lib/mock";
import { fmtMoney, fmtPct } from "@/lib/format";

export default function CompetitivePositioningPage() {
  const totalBrand = competitionByCategory.reduce((sum, c) => sum + c.brandSales, 0);
  const totalCategory = competitionByCategory.reduce((sum, c) => sum + c.categorySales, 0);
  const overallShare = (totalBrand / totalCategory) * 100;
  const avgPriceBrand =
    competitionByCategory.reduce((sum, c) => sum + c.brandAvgPrice, 0) /
    competitionByCategory.length;
  const avgPriceBench =
    competitionByCategory.reduce((sum, c) => sum + c.benchAvgPrice, 0) /
    competitionByCategory.length;

  return (
    <div>
      <PageHeader
        title="Posicionamiento Competitivo"
        subtitle="Tu marca comparada contra el benchmark agregado de otras marcas en TheLook. Sin nombres individuales."
      />
      <div className="mb-6 inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 border border-amber-500/20">
        🚧 Próximamente disponible en el siguiente PR
      </div>
      <Filters />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Share de ventas"
          value={fmtPct(overallShare)}
          delta={2.1}
          icon={<Target className="h-4 w-4" />}
          hint="vs benchmark"
        />
        <KpiCard label="Unidades share" value="14.8%" delta={1.4} icon={<Activity className="h-4 w-4" />} />
        <KpiCard
          label="Precio promedio marca"
          value={fmtMoney(avgPriceBrand)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Δ vs precio benchmark"
          value={fmtPct(((avgPriceBrand - avgPriceBench) / avgPriceBench) * 100)}
          delta={3.2}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}
