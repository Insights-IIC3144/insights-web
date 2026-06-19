import { cacheLife, cacheTag } from "next/cache";
import { AiInsightDto } from "@/types/insights";

export function buildAudienceSegment(
  gender: string,
  ageRange: string,
  trafficSource: string
): string {
  return `${gender || "all"}_${ageRange || "all"}_${trafficSource || "all"}`;
}

export async function getAudiencesInsights(
  brand: string,
  segment: string,
  days: string,
  gender: string,
  ageRange: string,
  trafficSource: string,
  accessToken: string
): Promise<AiInsightDto[]> {
  "use cache";
  cacheLife("daily");
  cacheTag("audiences-insights");
  cacheTag(`audiences-insights-${brand || "all"}-${segment}-${days || "all"}`);

  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  if (gender) params.set("gender", gender);
  if (ageRange) params.set("ageRange", ageRange);
  if (trafficSource) params.set("trafficSource", trafficSource);
  if (days) params.set("days", days);

  const res = await fetch(
    `${process.env.BACKEND_URL}/audiences/insights?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch audiences insights: ${res.status}`);
  }

  return res.json();
}
