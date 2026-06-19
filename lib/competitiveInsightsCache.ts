import { cacheLife, cacheTag } from "next/cache";
import { CompetitiveInsightDto } from "@/types/competitive";

export async function getCompetitiveInsights(
  brand: string,
  category: string,
  days: string,
  accessToken: string
): Promise<CompetitiveInsightDto[]> {
  "use cache";
  cacheLife("daily");
  cacheTag("competitive-insights");
  cacheTag(`competitive-insights-${brand || "all"}-${category || "all"}-${days || "all"}`);

  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);
  if (days) params.set("days", days);

  const res = await fetch(
    `${process.env.BACKEND_URL}/competitive/insights?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch competitive insights: ${res.status}`);
  }

  return res.json();
}
