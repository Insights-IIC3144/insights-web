export interface FilterParams {
  brand?: string;
  category?: string;
  department?: string;
  country?: string;
  gender?: string;
  trafficSource?: string;
  days?: number;
  granularity?: string; 
}

export interface FiltersData {
  categories: string[];
  departments: string[];
  countries: string[];
  trafficSources: string[];
  genders: string[];
}
