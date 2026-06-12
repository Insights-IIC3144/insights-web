import { FilterParams } from "@/types/shared";
import { CatalogProductDto, AiInsightDto } from "@/types/catalog";

const buildQueryString = (params: FilterParams): string => {
  const queryParams = new URLSearchParams();
  
  if (params.days) queryParams.append("days", params.days.toString());
  if (params.brand) queryParams.append("brand", params.brand);
  if (params.category) queryParams.append("category", params.category);
  if (params.department) queryParams.append("department", params.department);
  
  return queryParams.toString();
};

export const catalogService = {
  getProducts: async (params: FilterParams): Promise<CatalogProductDto[]> => {
    const qs = buildQueryString(params);
    const res = await fetch(`/api/proxy/catalog/products?${qs}`);
    
    if (!res.ok) {
      if (res.status === 404) return []; // Si no hay datos, retornamos vacío
      throw new Error(`Failed to fetch catalog products: ${res.status}`);
    }
    
    return res.json();
  },

  getInsights: async (params: FilterParams): Promise<AiInsightDto[]> => {
    const qs = buildQueryString(params);
    const res = await fetch(`/api/proxy/catalog/insights?${qs}`);
    
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch catalog insights: ${res.status}`);
    }
    
    return res.json();
  },

  regenerateInsight: async (params: FilterParams, excludeTitles: string[], excludeType?: string): Promise<AiInsightDto[]> => {
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
        excludeType
      }),
    });
    
    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to regenerate catalog insight: ${res.status}`);
    }
    
    return res.json();
  }
};
