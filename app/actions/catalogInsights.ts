"use server";
import { revalidateTag } from "next/cache";

export async function revalidateCatalogInsights(brand: string, category: string) {
  revalidateTag(`catalog-insights-${brand || "all"}-${category || "all"}`, "daily");
}
