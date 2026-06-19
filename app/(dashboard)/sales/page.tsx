"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { SalesKpiGrid } from "@/components/dashboard/SalesKpiGrid";
import { SalesCharts } from "@/components/dashboard/SalesCharts";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { BestWorstProducts } from "@/components/dashboard/BestWorstProducts";
import { useSalesData } from "@/hooks/useSalesData";
import { toggleFilter } from "@/lib/utils";

export default function SalesDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [granularity, setGranularity] = useState("monthly");
  const [topLimit, setTopLimit] = useState(5);
  const { kpis, prior, categorySales, performance, topProducts, loading } = useSalesData(
    activeFilters,
    granularity,
    topLimit
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard de Ventas"
        subtitle="Resumen de rendimiento y métricas clave de tu negocio."
      />

      <div className="flex items-center justify-between gap-4">
        <Filters value={activeFilters} onChange={setActiveFilters} />
      </div>

      <SalesKpiGrid data={kpis} prior={prior} loading={loading} />
      <SalesCharts
        kpis={kpis}
        categorySales={categorySales}
        loading={loading}
        granularity={granularity}
        onGranularityChange={setGranularity}
        onCategorySelect={(cat) => setActiveFilters(prev => toggleFilter(prev, "category", cat))}
      />
      <PerformanceTable performance={performance} loading={loading} />
      <BestWorstProducts
        data={topProducts}
        loading={loading}
        limit={topLimit}
        onLimitChange={setTopLimit}
      />
    </div>
  );
}