"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { SalesKpiGrid } from "@/components/dashboard/SalesKpiGrid";
import { SalesCharts } from "@/components/dashboard/SalesCharts";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { useSalesData } from "@/hooks/useSalesData";

export default function SalesDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { kpis, deltas, categorySales, performance, loading } = useSalesData(activeFilters);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard de Ventas"
        subtitle="Resumen de rendimiento y métricas clave de tu negocio."
      />

      <div className="flex items-center justify-between gap-4">
        <Filters value={activeFilters} onChange={setActiveFilters} />
      </div>

      <SalesKpiGrid data={kpis} deltas={deltas} loading={loading} />
      <SalesCharts kpis={kpis} categorySales={categorySales} loading={loading} onCategorySelect={(cat) => setActiveFilters(prev => ({ ...prev, category: cat }))} />
      <PerformanceTable performance={performance} loading={loading} />
    </div>
  );
}