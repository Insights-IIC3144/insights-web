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
  const [granularity, setGranularity] = useState("monthly");
  const { kpis, categorySales, performance, loading } = useSalesData(activeFilters, granularity);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER Y FILTROS */}
      <PageHeader
        title="Dashboard de Ventas"
        subtitle="Resumen de rendimiento y métricas clave de tu negocio."
      />
      <Filters onChange={setActiveFilters} />

      {/* KPI CARDS */}
      <SalesKpiGrid data={kpis} loading={loading} />

      {/* CHARTS AREA */}
      <SalesCharts
        kpis={kpis}
        categorySales={categorySales}
        loading={loading}
        granularity={granularity}
        onGranularityChange={setGranularity}
      />

      {/* PERFORMANCE TABLE */}
      <PerformanceTable performance={performance} loading={loading} />

    </div>
  );
}