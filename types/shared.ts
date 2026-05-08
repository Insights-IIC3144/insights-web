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

export interface UserProfile {
  email: string;
  name: string;
  role: 'brand' | 'retailer_admin';
  brand: string | null;
  isActive: boolean;
  retailerName: string;
}