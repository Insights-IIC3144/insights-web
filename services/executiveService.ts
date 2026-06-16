import { api } from "@/lib/api";
import { ExecutiveKpi, ExecutiveKpisWithPrior, CategorySales } from "@/types/executive";
import { AudiencesData, RetentionData } from "@/types/executive";
import { FilterParams } from "@/types/shared";

export const executiveService = {
  getKpis: (params: FilterParams) => 
    api.get<ExecutiveKpi[]>('/executive/kpis', params as any),

  getKpisWithPrior: (params: FilterParams) =>
    api.get<ExecutiveKpisWithPrior>('/executive/kpis-with-prior', params as any),
    
  getCategorySales: (params: FilterParams) => 
    api.get<CategorySales[]>('/executive/category-sales', params as any),

  getAudiences: (params: FilterParams) =>
    api.get<AudiencesData>('/executive/audiences', params as any),

  getRetention: (params: FilterParams) =>
    api.get<RetentionData>('/executive/retention', params as any),
};
