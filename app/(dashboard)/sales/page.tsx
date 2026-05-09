"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { SalesKpiGrid } from "@/components/dashboard/SalesKpiGrid";
import { SalesCharts } from "@/components/dashboard/SalesCharts";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { GranularitySelector } from "@/components/dashboard/GranularitySelector";
import { useSalesData } from "@/hooks/useSalesData";

export default function SalesDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [granularity, setGranularity] = useState("monthly");
  const { kpis, categorySales, performance, loading } = useSalesData(activeFilters, granularity);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard de Ventas"
        subtitle="Resumen de rendimiento y métricas clave de tu negocio."
      />

      <div className="flex items-center justify-between gap-4">
        <Filters onChange={setActiveFilters} />
        <GranularitySelector value={granularity} onChange={setGranularity} />
      </div>

      <SalesKpiGrid data={kpis} loading={loading} />
      <SalesCharts kpis={kpis} categorySales={categorySales} loading={loading} />
      <PerformanceTable performance={performance} loading={loading} />
    </div>
  );
}