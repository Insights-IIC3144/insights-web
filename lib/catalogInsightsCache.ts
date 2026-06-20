import { cacheLife, cacheTag } from "next/cache";
import { AiInsightDto } from "@/types/catalog";

export async function getCatalogInsights(
  brand: string,
  category: string,
  days: string,
  accessToken: string
): Promise<AiInsightDto[]> {
  "use cache";
  cacheLife("daily");
  cacheTag("catalog-insights");
  cacheTag(`catalog-insights-${brand || "all"}-${category || "all"}-${days || "all"}`);

  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);
  if (days) params.set("days", days);

  const res = await fetch(
    `${process.env.BACKEND_URL}/catalog/insights?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch catalog insights: ${res.status}`);
  }

  return res.json();
}
