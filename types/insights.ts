export interface AiInsightDto {
  id: string;
  scope: "brand" | "product" | "audience";
  affectedItems: { id: string | number; name: string; url?: string }[];
  type: "warning" | "opportunity" | "price" | "cannibalization" | "market_share" | "dead_stock" | "cross_sell" | "returns" | "return_rate";
  title: string;
  description: string;
  impactScore: number;
}
