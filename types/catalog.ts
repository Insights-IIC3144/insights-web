export interface CatalogProductDto {
  productId: string;
  productName: string;
  category: string;
  department: string;
  retailPrice: number;
  unitsSold: number;
  revenueNet: number;
  returnRate: number;
  marketShare: number;
}

export interface GlobalKpiDto {
  totalProducts: number;
  totalRevenue: number;
  avgReturnRate: number;
}

export type { AiInsightDto } from "@/types/insights";
