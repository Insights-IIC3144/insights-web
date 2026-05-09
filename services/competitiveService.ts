import { api } from "@/lib/api";
import { FilterParams } from "@/types/shared";
import { CompetitiveCategory, CompetitiveCardsData } from "@/types/competitive";

export const competitiveService = {
     getAll: (params: FilterParams) =>
        api.get<CompetitiveCategory[]>("/competitive/all", params as any),

    getCards: (params: FilterParams & { brand: string }) =>
        api.get<CompetitiveCardsData>("/competitive/performance-cards", params as any),
};
