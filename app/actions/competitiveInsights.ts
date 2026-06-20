"use server";
import { revalidateTag } from "next/cache";

export async function revalidateCompetitiveInsights(brand: string, category: string, days: string) {
  revalidateTag(`competitive-insights-${brand || "all"}-${category || "all"}-${days || "all"}`, "daily");
}
