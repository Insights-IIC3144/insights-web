import { api } from "@/lib/api";
import { FilterParams } from "@/types/shared";
import { CompetitiveCategory, CompetitiveCardsData, CompetitiveInsightDto } from "@/types/competitive";

export const competitiveService = {
     getAll: (params: FilterParams) =>
        api.get<CompetitiveCategory[]>("/competitive/all", params as any),

    getCards: (params: FilterParams & { brand: string }) =>
        api.get<CompetitiveCardsData>("/competitive/performance-cards", params as any),

    getInsights: (params: FilterParams & { brand: string }) =>
        api.get<CompetitiveInsightDto[]>("/competitive/insights", params as any),

    regenerateInsight: (params: FilterParams & { brand: string, category: string }, excludeTitles: string[]) =>
        api.post<CompetitiveInsightDto[]>("/competitive/insights/regenerate", {
            brand: params.brand,
            days: params.days,
            category: params.category,
            department: params.department,
            excludeTitles
        }),
};
