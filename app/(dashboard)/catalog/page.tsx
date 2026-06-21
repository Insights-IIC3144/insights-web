"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { CatalogKpiGrid } from "@/components/dashboard/CatalogKpiGrid";
import { CatalogTable } from "@/components/dashboard/CatalogTable";
import { AiActionCards } from "@/components/dashboard/AiActionCards";
import { useCatalogData } from "@/hooks/useCatalogData";

export default function CatalogDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { insights, kpis, loadingKpis, loadingInsights, refetchInsights, replaceInsight } = useCatalogData(activeFilters);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Catálogo de Productos"
        subtitle="Analiza el rendimiento de tu catálogo y descubre oportunidades de optimización con IA."
      />

      <div className="flex items-center justify-between gap-4">
        <Filters onChange={setActiveFilters} />
      </div>

      <CatalogKpiGrid data={kpis} loading={loadingKpis} />
      
      {/* AI Action Cards Section */}
      <AiActionCards insights={insights} loading={loadingInsights} mode="catalog" onRefresh={refetchInsights} onRegenerate={replaceInsight} />
      
      {/* Product Table Section */}
      <CatalogTable localFilters={activeFilters} />
    </div>
  );
}
