export interface SalesDailyKpi {
  date: string;
  revenue: number;
  orders: number;
  unitsSold: number;
}

export interface SalesByCategory {
  category: string;
  revenue: number;
  percentage: number;
}

export interface SalesPerformanceByDimension {
  dimensionName: string; // e.g., Country or Traffic Source
  revenue: number;
  orders: number;
  unitsSold: number;
}
