import { api } from "@/lib/api";
import { AudiencesKpis, AudiencesGender, AudiencesAge, AudiencesRfm, AudiencesFunnel } from "@/types/audiences";
import { AiInsightDto } from "@/types/insights";
import { FilterParams } from "@/types/shared";

export const audiencesService = {
  getKpis: (params: FilterParams) =>
    api.get<AudiencesKpis>('/audiences/kpis', params as any),

  getGenderBreakdown: (params: FilterParams) =>
    api.get<AudiencesGender[]>('/audiences/gender-breakdown', params as any),

  getAgeBreakdown: (params: FilterParams) =>
    api.get<AudiencesAge[]>('/audiences/age-breakdown', params as any),

  getRfmCohorts: (params: FilterParams) =>
    api.get<AudiencesRfm[]>('/audiences/rfm-cohorts', params as any),

  getFunnel: (params: FilterParams) =>
    api.get<AudiencesFunnel[]>('/audiences/funnel', params as any),

  getInsights: async (params: FilterParams): Promise<AiInsightDto[]> => {
    // Route through the cached insights endpoint — brand, gender, ageRange, trafficSource and days are cache discriminators.
    // Department and other filters are intentionally omitted from the insights call.
    const insightParams = new URLSearchParams();
    if (params.brand) insightParams.append("brand", params.brand);
    if (params.gender) insightParams.append("gender", params.gender);
    if (params.ageRange) insightParams.append("ageRange", params.ageRange);
    if (params.trafficSource) insightParams.append("trafficSource", params.trafficSource);
    if (params.days) insightParams.append("days", params.days.toString());

    const res = await fetch(`/api/audiences-insights?${insightParams}`);

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch audiences insights: ${res.status}`);
    }

    return res.json();
  },
};
