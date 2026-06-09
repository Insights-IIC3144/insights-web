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
    // Route through the cached insights endpoint — only brand+category are cache discriminators.
    // Days and department are intentionally omitted from the insights call.
    const insightParams = new URLSearchParams();
    if (params.brand) insightParams.append("brand", params.brand);
    if (params.category) insightParams.append("category", params.category);

    const res = await fetch(`/api/catalog-insights?${insightParams}`);

    if (!res.ok) {
      if (res.status === 404) return [];
      throw new Error(`Failed to fetch catalog insights: ${res.status}`);
    }
    
    return res.json();
  }
};
