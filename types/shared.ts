export interface FilterParams {
  category?: string;
  department?: string;
  country?: string;
  gender?: string;
  trafficSource?: string;
  days?: number;
}

export interface FiltersData {
  categories: string[];
  departments: string[];
  countries: string[];
  trafficSources: string[];
  genders: string[];
}
