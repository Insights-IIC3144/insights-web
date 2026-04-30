import { api } from "@/lib/api";
import { FiltersData } from "@/types/shared";

export const filterService = {
  getFilters: () => api.get<FiltersData>('/filters'),
};
