import { FilterParams } from "@/types/shared";
import { CatalogProductDto, AiInsightDto, GlobalKpiDto, GlobalKpiWithPrior } from "@/types/catalog";
import { PaginatedResponse } from "@/types/shared";

const buildQueryString = (params: FilterParams): string => {
  const queryParams = new URLSearchParams();
  
  if (params.days) queryParams.append("days", params.days.toString());
  if (params.brand) queryParams.append("brand", params.brand);
  if (params.category) queryParams.append("category", params.category);
  if (params.department) queryParams.append("department", params.department);
  
  return queryParams.toString();
};

export const catalogService = {
  getProducts: async (params: FilterParams, page: number = 0, size: number = 15, sortField?: string, sortDirection?: string, search?: string): Promise<PaginatedResponse<CatalogProductDto>> => {
    const qs = buildQueryString(params);
    const fullQs = new URLSearchParams(qs);
    fullQs.append("page", page.toString());
    fullQs.append("size", size.toString());
    if (sortField) fullQs.append("sortField", sortField);
    if (sortDirection) fullQs.append("sortDirection", sortDirection);
    if (search) fullQs.append("search", search);

    const res = await fetch(`/api/proxy/catalog/products?${fullQs.toString()}`);
    
    if (!res.ok) {
      if (res.status === 404) return { data: [], totalElements: 0, totalPages: 0, currentPage: 0 };
      throw new Error(`Failed to fetch catalog products: ${res.status}`);
    }
    
    return res.json();
  },

  getGlobalKpis: async (params: FilterParams, search?: string): Promise<GlobalKpiDto> => {
    const qs = buildQueryString(params);
    const fullQs = new URLSearchParams(qs);
    if (search) fullQs.append("search", search);

    const res = await fetch(`/api/proxy/catalog/kpis?${fullQs.toString()}`);
    
    if (!res.ok) {
      if (res.status === 404) return { totalProducts: 0, totalRevenue: 0, avgReturnRate: 0 };
      throw new Error(`Failed to fetch catalog KPIs: ${res.status}`);
    }
    
    return res.json();
  },

  getKpisWithPrior: async (params: FilterParams, search?: string): Promise<GlobalKpiWithPrior> => {
    const qs = buildQueryString(params);
    const fullQs = new URLSearchParams(qs);
    if (search) fullQs.append("search", search);

    const res = await fetch(`/api/proxy/catalog/kpis-with-prior?${fullQs.toString()}`);
    
    if (!res.ok) {
      if (res.status === 404) return { current: [], prior: [] };
      throw new Error(`Failed to fetch catalog KPIs with prior: ${res.status}`);
    }
    
    return res.json();
  },

  getInsights: async (params: FilterParams): Promise<AiInsightDto[]> => {
    // Route through the cached insights endpoint — brand, category and days are cache discriminators.
    // Department is intentionally omitted from the insights call.
    const insightParams = new URLSearchParams();
    if (params.brand) insightParams.append("brand", params.brand);
    if (params.category) insightParams.append("category", params.category);
    if (params.days) insightParams.append("days", params.days.toString());

    const res = await fetch(`/api/catalog-insights?${insightParams}`);

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch catalog insights: ${res.status}`);
    }
    
    return res.json();
  },

  regenerateInsight: async (params: FilterParams, excludeTitles: string[], excludeType?: string, currentInsightsContext?: string[]): Promise<AiInsightDto[]> => {
    const res = await fetch(`/api/proxy/catalog/insights/regenerate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand: params.brand,
        days: params.days,
        category: params.category,
        department: params.department,
        excludeTitles,
        excludeType,
        currentInsightsContext
      }),
    });
    
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to regenerate catalog insight: ${res.status}`);
    }
    
    return res.json();
  },

  evictInsightsCache: async (): Promise<void> => {
    await fetch(`/api/proxy/catalog/insights/cache/evict`, {
      method: "POST"
    });
  }
};
