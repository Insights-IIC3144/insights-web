"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { ExecutiveKpiGrid } from "@/components/dashboard/ExecutiveKpiGrid";
import { ExecutiveCharts } from "@/components/dashboard/ExecutiveCharts";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { ExecutivePerformanceCards } from "@/components/dashboard/ExecutivePerformanceCards";

export default function ExecutiveDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { kpis, deltas, categorySales, loading } = useExecutiveData(activeFilters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Ejecutivo"
        subtitle="Visión ejecutiva del desempeño de tu marca dentro de TheLook eCommerce."
      />
      
      <Filters 
        showGender 
        showTraffic 
        value={activeFilters}
        onChange={setActiveFilters} 
      />

      <ExecutiveKpiGrid 
        data={kpis} 
        deltas={deltas} 
        loading={loading} 
      />

      <ExecutiveCharts 
        kpis={kpis} 
        categorySales={categorySales} 
        loading={loading}
        onCategorySelect={(cat) => setActiveFilters(prev => ({ ...prev, category: cat }))}
      />

      <ExecutivePerformanceCards activeFilters={activeFilters} />
    </div>
  );
}
