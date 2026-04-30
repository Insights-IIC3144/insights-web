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
