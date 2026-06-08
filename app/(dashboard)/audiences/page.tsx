"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { AudiencesKpiGrid } from "@/components/dashboard/AudiencesKpiGrid";
import { AudiencesCharts } from "@/components/dashboard/AudiencesCharts";
import { RfmBubbleChart } from "@/components/dashboard/RfmBubbleChart";
import { FunnelTable } from "@/components/dashboard/FunnelTable";
import { useAudiencesData } from "@/hooks/useAudiencesData";

export default function AudiencesDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { kpis, gender, age, rfm, funnel, loading } = useAudiencesData(activeFilters);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Audiencias"
        subtitle="Quién compra tu marca en TheLook. Datos agregados, sin información personal identificable."
      />

      <Filters onChange={setActiveFilters} showGender showTraffic showAge />

      <AudiencesKpiGrid data={kpis} loading={loading} />
      <AudiencesCharts gender={gender} age={age} loading={loading} />
      <RfmBubbleChart data={rfm} loading={loading} />
      <FunnelTable data={funnel} loading={loading} />
    </div>
  );
}
