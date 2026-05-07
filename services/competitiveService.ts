import { api } from "@/lib/api";
import { FilterParams } from "@/types/shared";
import { CompetitiveCategory } from "@/types/competitive";

export const competitiveService = {
     getAll: (params: FilterParams) =>
        api.get<CompetitiveCategory[]>("/competitive/all", params as any),
};
