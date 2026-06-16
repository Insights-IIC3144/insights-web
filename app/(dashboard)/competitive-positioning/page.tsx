"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { Filters } from "@/components/ui-extra/Filters";
import { CompetitiveKpiGrid } from "@/components/dashboard/CompetitiveKpiGrid";
import { CompetitiveCharts } from "@/components/dashboard/CompetitiveCharts";
import { useCompetitiveData } from "@/hooks/useCompetitiveData";

export default function CompetitivePositioningPage() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { loading, loadingInsights, insights, stats } = useCompetitiveData(activeFilters);

  return (
    <div>
      <PageHeader
        title="Posicionamiento Competitivo"
        subtitle="Tu marca comparada contra el benchmark agregado de otras marcas en TheLook. Sin nombres individuales."
      />

      <Filters value={activeFilters} onChange={setActiveFilters} />

      <CompetitiveKpiGrid kpis={stats?.kpis ?? null} deltas={stats?.deltas ?? null} loading={loading} />

      {!loading && stats && (
        <CompetitiveCharts
          salesShareByCategory={stats.salesShareByCategory}
          detailByCategory={stats.detailByCategory}
          topCategories={stats.topCategories}
          loading={loading}
          onCategorySelect={(cat) => setActiveFilters(prev => ({ ...prev, category: cat }))}
          insights={insights}
          loadingInsights={loadingInsights}
        />
      )}

      {!loading && !stats && (
        <div className="panel flex items-center justify-center h-64">
          <p className="text-muted-foreground text-sm">
            Selecciona una marca en el menú superior para ver el posicionamiento competitivo.
          </p>
        </div>
      )}
    </div>
  );
}
