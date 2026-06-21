"use server";
import { revalidateTag } from "next/cache";
import { buildAudienceSegment } from "@/lib/audiencesInsightsCache";

export async function revalidateAudiencesInsights(
  brand: string,
  gender: string,
  ageRange: string,
  trafficSource: string,
  days: string
) {
  const segment = buildAudienceSegment(gender, ageRange, trafficSource);
  revalidateTag(`audiences-insights-${brand || "all"}-${segment}-${days || "all"}`, "daily");
}
