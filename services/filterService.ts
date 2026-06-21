import { api } from "@/lib/api";
import { FiltersData } from "@/types/shared";

export const filterService = {
  getFilters: (brand?: string) => 
    api.get<FiltersData>(brand && brand !== "all" ? `/filters?brand=${encodeURIComponent(brand)}` : '/filters'),
};
