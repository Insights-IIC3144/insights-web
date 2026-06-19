"use client";

import { useState } from "react";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { AudiencesKpiGrid } from "@/components/dashboard/AudiencesKpiGrid";
import { AudiencesCharts } from "@/components/dashboard/AudiencesCharts";
import { RfmBubbleChart } from "@/components/dashboard/RfmBubbleChart";
import { FunnelTable } from "@/components/dashboard/FunnelTable";
import { AiActionCards } from "@/components/dashboard/AiActionCards";
import { useAudiencesData } from "@/hooks/useAudiencesData";
import { AiInsightDto } from "@/types/insights";

const SECTION_IDS = ["audiences-kpis", "audiences-charts", "rfm-chart", "funnel-table"];

function scrollToInsightSection(insight: AiInsightDto) {
  const sectionId = insight.affectedItems?.[0]?.id;
  if (!sectionId || !SECTION_IDS.includes(String(sectionId))) return;
  const el = document.getElementById(String(sectionId));
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("ring-2", "ring-indigo-400", "ring-offset-2", "rounded-xl");
    setTimeout(() => el.classList.remove("ring-2", "ring-indigo-400", "ring-offset-2", "rounded-xl"), 2000);
  }
}

export default function AudiencesDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { kpis, gender, age, rfm, funnel, loading, insights, loadingInsights, refetchInsights } =
    useAudiencesData(activeFilters);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Audiencias"
        subtitle="Quién compra tu marca en TheLook. Datos agregados, sin información personal identificable."
      />

      <Filters onChange={setActiveFilters} showGender showTraffic showAge />

      <div id="audiences-kpis">
        <AudiencesKpiGrid data={kpis} loading={loading} />
      </div>

      <AiActionCards
        insights={insights}
        loading={loadingInsights}
        mode="audiences"
        onRefresh={refetchInsights}
        onAction={scrollToInsightSection}
        actionLabel="Ver en dashboard"
      />

      <div id="audiences-charts">
        <AudiencesCharts gender={gender} age={age} loading={loading} />
      </div>
      <div id="rfm-chart">
        <RfmBubbleChart data={rfm} loading={loading} />
      </div>
      <div id="funnel-table">
        <FunnelTable data={funnel} loading={loading} />
      </div>
    </div>
  );
}
