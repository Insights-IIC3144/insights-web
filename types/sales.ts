export interface SalesKpi {
  date: string;
  brand: string;
  totalOrders: number;
  revenueGross: number;
  revenueNet: number;
  unitsSold: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  lossRate: number;
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

export interface TopProductEntry {
  productId: string;
  productName: string;
  category: string;
  revenueNet: number;
  unitsSold: number;
  rank: number;
}

export interface TopProductsData {
  best: TopProductEntry[];
  worst: TopProductEntry[];
}
