import { api } from "@/lib/api";
import { FilterParams } from "@/types/shared";
import { CompetitiveCategory, CompetitiveCardsData, CompetitiveWithPrior, CompetitiveInsightDto } from "@/types/competitive";

export const competitiveService = {
    getAll: (params: FilterParams) =>
        api.get<CompetitiveCategory[]>("/competitive/all", params as any),

    getAllWithPrior: (params: FilterParams) =>
        api.get<CompetitiveWithPrior>("/competitive/all-with-prior", params as any),

    getCards: (params: FilterParams & { brand: string }) =>
        api.get<CompetitiveCardsData>("/competitive/performance-cards", params as any),

    getInsights: async (params: FilterParams & { brand: string }): Promise<CompetitiveInsightDto[]> => {
        // Route through the cached insights endpoint — brand, category and days are cache discriminators.
        // Department is intentionally omitted from the insights call.
        const insightParams = new URLSearchParams();
        if (params.brand) insightParams.append("brand", params.brand);
        if (params.category) insightParams.append("category", params.category);
        if (params.days) insightParams.append("days", params.days.toString());

        const res = await fetch(`/api/competitive-insights?${insightParams}`);

        if (!res.ok) {
            if (res.status === 404) return [];
            throw new Error(`Failed to fetch competitive insights: ${res.status}`);
        }

        return res.json();
    },

    regenerateInsight: (params: FilterParams & { brand: string, category: string }, excludeTitles: string[]) =>
        api.post<CompetitiveInsightDto[]>("/competitive/insights/regenerate", {
            brand: params.brand,
            days: params.days,
            category: params.category,
            department: params.department,
            excludeTitles
        }),
};
