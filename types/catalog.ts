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

export interface AiInsightDto {
  id: string;
  scope: "brand" | "product";
  affectedItems: { id: string | number; name: string; url?: string }[];
  type: "warning" | "opportunity" | "price" | "cannibalization" | "market_share" | "dead_stock" | "cross_sell" | "returns" | "return_rate";
  title: string;
  description: string;
  impactScore: number;
}
