import { api } from "@/lib/api";
import { SalesKpi, SalesKpisWithPrior, SalesByCategory, SalesPerformanceByDimension, TopProductsData } from "@/types/sales";
import { FilterParams } from "@/types/shared";

export const salesService = {
  getKpis: (params: FilterParams) =>
    api.get<SalesKpi[]>('/sales/kpis', params as any),

  getKpisWithPrior: (params: FilterParams) =>
    api.get<SalesKpisWithPrior>('/sales/kpis-with-prior', params as any),

  getCategorySales: (params: FilterParams) =>
    api.get<SalesByCategory[]>('/sales/category-sales', params as any),

  getPerformance: (params: FilterParams) =>
    api.get<SalesPerformanceByDimension[]>('/sales/performance', params as any),

  getTopProducts: (params: FilterParams & { limit?: number }) =>
    api.get<TopProductsData>('/sales/top-products', params as any),
};
