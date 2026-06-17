import { useState, useEffect, useMemo, useRef } from "react";
import { competitiveService } from "@/services/competitiveService";
import { CompetitiveCategory, CompetitiveInsightDto } from "@/types/competitive";
import { useUserContext } from "@/context/UserContext";
import { FilterParams } from "@/types/shared";

export function useCompetitiveData(activeFilters: Record<string, string>) {
    const [categories, setCategories] = useState<CompetitiveCategory[]>([]);
    const [insights, setInsights] = useState<CompetitiveInsightDto[]>([]);
    const insightsRef = useRef<CompetitiveInsightDto[]>([]);

    useEffect(() => {
        insightsRef.current = insights;
    }, [insights]);
    const [loading, setLoading] = useState(true);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const { days, selectedBrand: brand } = useUserContext();

    useEffect(() => {
        if (!brand || brand.trim() === "") {
            setCategories([]);
            setInsights([]);
            setLoading(false);
            setLoadingInsights(false);
            return;
        }

        let cancelled = false;

        const fetchData = () => {
            setLoading(true);
            setLoadingInsights(true);
            setCategories([]);
            setInsights([]);
            
            const params: FilterParams & { brand: string } = {
                brand,
                ...Object.fromEntries(
                    Object.entries(activeFilters).filter(([, v]) => v !== "")
                ),
            };
            if (days > 0) params.days = days;

            // Load categories data
            competitiveService.getAll(params)
                .then(data => {
                    if (cancelled) return;
                    setCategories(data || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching competitive data:", err);
                    if (cancelled) return;
                    setCategories([]);
                    setLoading(false);
                });

            // Load AI insights data in parallel
            competitiveService.getInsights(params)
                .then(data => {
                    if (cancelled) return;
                    setInsights(data || []);
                    setLoadingInsights(false);
                })
                .catch(err => {
                    console.error("Error fetching competitive insights:", err);
                    if (cancelled) return;
                    setInsights([]);
                    setLoadingInsights(false);
                });
        };

        fetchData();
        return () => { cancelled = true; };
    }, [activeFilters, days, brand]);

    const stats = useMemo(() => {
        if (!categories.length) return null;

        let sumBrandSales = 0;
        let sumCategorySales = 0;
        let sumBrandVolume = 0;
        let sumCategoryVolume = 0;
        let sumBenchSales = 0;
        let sumBenchVolume = 0;

        categories.forEach((c) => {
            sumBrandSales += c.brandSales;
            sumCategorySales += c.categorySales;
            sumBrandVolume += c.brandVolume;
            sumCategoryVolume += c.categoryVolume;
            sumBenchSales += c.salesBenchmark;
            sumBenchVolume += c.volumeBenchmark;
        });

        const overallSalesShare = sumCategorySales ? (sumBrandSales / sumCategorySales) * 100 : 0;
        const overallVolumeShare = sumCategoryVolume ? (sumBrandVolume / sumCategoryVolume) * 100 : 0;

        const avgPriceBrand = sumBrandVolume ? (sumBrandSales / sumBrandVolume) : 0;
        const avgPriceBench = sumBenchVolume ? (sumBenchSales / sumBenchVolume) : 0;

        const priceGapPct = avgPriceBench ? ((avgPriceBrand - avgPriceBench) / avgPriceBench) * 100 : 0;

        const detailByCategory = categories.map((c) => ({
            ...c,
            salesSharePct: c.salesShare * 100,
            volumeSharePct: c.volumeShare * 100,
            priceGapPct: c.averageBenchmarkPrice
                ? ((c.averageBrandPrice - c.averageBenchmarkPrice) / c.averageBenchmarkPrice) * 100
                : 0,
        }));

        const salesShareByCategory = detailByCategory.map((r) => ({ category: r.category, sharePct: r.salesSharePct }));
        const topCategories = [...detailByCategory].sort((a, b) => b.salesSharePct - a.salesSharePct);

        return {
            kpis: {
                overallSalesShare,
                overallVolumeShare,
                avgPriceBrand,
                priceGapPct,
            },
            detailByCategory,
            salesShareByCategory,
            topCategories,
        };
    }, [categories]);

    const replaceInsight = async (targetCategory: string) => {
        if (!brand || brand.trim() === "") throw new Error("Debe seleccionar una marca para regenerar insights");
        const excludeTitles = insightsRef.current.map(i => i.opportunityTitle);
        const params: FilterParams & { brand: string, category: string } = {
            brand,
            category: targetCategory,
            ...Object.fromEntries(
                Object.entries(activeFilters).filter(([, v]) => v !== "")
            ),
        };
        if (days > 0) params.days = days;

        try {
            const newInsights = await competitiveService.regenerateInsight(params, excludeTitles);
            if (newInsights && newInsights.length > 0) {
                setInsights(prev => {
                    const exists = prev.some(i => i.category === targetCategory);
                    if (exists) {
                        return prev.map(i => i.category === targetCategory ? newInsights[0] : i);
                    } else {
                        return [...prev, newInsights[0]];
                    }
                });
            }
        } catch (err) {
            console.error("Error regenerating competitive insight:", err);
            throw err;
        }
    };

    return { loading, loadingInsights, insights, stats, replaceInsight };
}