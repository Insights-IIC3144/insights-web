export interface ExecutiveKpisWithPrior {
  current: ExecutiveKpi[];
  prior: ExecutiveKpi[];
}

export interface ExecutiveKpi {
  date: string;
  brand: string;
  revenue: number;
  totalOrders: number;
  unitsSold: number;
  uniqueCustomers: number;
}

export interface CategorySales {
  date: string;
  brand: string;
  category: string;
  revenue: number;
}

export interface SalesTrendPoint {
  label: string;
  revenue: number;
}

export interface AudiencesData {
  mainChannel: string | null;
  mainCity: string | null;
  mainAgeRange: string | null;
  ageRangePercentage: number | null;
}

export interface RetentionData {
  recurringBuyers: number | null;
  avgProductsPerClient: number | null;
  topRetentionChannel: string | null;
}
