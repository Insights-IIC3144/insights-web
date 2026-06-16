export interface CatalogProductDto {
  productId: number;
  productName: string;
  category: string;
  department: string;
  retailPrice: number;
  unitsSold: number;
  revenueNet: number;
  returnRate: number;
  marketShare?: number;
}

export type { AiInsightDto } from "@/types/insights";
