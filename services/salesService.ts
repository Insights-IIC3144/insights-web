import { api } from "@/lib/api";
import { SalesDailyKpi, SalesByCategory, SalesPerformanceByDimension } from "@/types/sales";
import { FilterParams } from "@/types/shared";

export const salesService = {
  getKpis: (params: FilterParams) => 
    api.get<SalesDailyKpi[]>('/sales/kpis', params as any),
    
  getCategorySales: (params: FilterParams) => 
    api.get<SalesByCategory[]>('/sales/category-sales', params as any),

  getPerformance: (params: FilterParams) => 
    api.get<SalesPerformanceByDimension[]>('/sales/performance', params as any),
};
