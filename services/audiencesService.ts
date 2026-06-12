import { api } from "@/lib/api";
import { AudiencesKpis, AudiencesGender, AudiencesAge, AudiencesRfm, AudiencesFunnel } from "@/types/audiences";
import { AiInsightDto } from "@/types/catalog";
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

  getInsights: (params: FilterParams) =>
    api.get<AiInsightDto[]>('/audiences/insights', params as any),
};
