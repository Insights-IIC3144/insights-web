import { api } from "@/lib/api";
import { ExecutiveKpi, CategorySales } from "@/types/executive";
import { AudienciasData, RetencionData } from "@/types/executive";
import { FilterParams } from "@/types/shared";

export const executiveService = {
  getKpis: (params: FilterParams) => 
    api.get<ExecutiveKpi[]>('/executive/kpis', params as any),
    
  getCategorySales: (params: FilterParams) => 
    api.get<CategorySales[]>('/executive/category-sales', params as any),

  getAudiencias: (params: FilterParams) =>
    api.get<AudienciasData>('/executive/audiencias', params as any),

  getRetencion: (params: FilterParams) =>
    api.get<RetencionData>('/executive/retencion', params as any),
};
