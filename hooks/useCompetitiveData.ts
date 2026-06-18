import { useState, useEffect, useMemo, useRef } from "react";
import { competitiveService } from "@/services/competitiveService";
import { CompetitiveCategory, CompetitiveWithPrior, CompetitiveInsightDto } from "@/types/competitive";
import { useUserContext } from "@/context/UserContext";
import { FilterParams } from "@/types/shared";
import { pctChange } from "@/lib/utils";

function computeKpis(categories: CompetitiveCategory[]) {
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

    return { overallSalesShare, overallVolumeShare, avgPriceBrand, priceGapPct };
}

function computeDeltas(
    current: ReturnType<typeof computeKpis>,
    prior: ReturnType<typeof computeKpis>
) {
    return {
        overallSalesShare: pctChange(current.overallSalesShare, prior.overallSalesShare),
        overallVolumeShare: pctChange(current.overallVolumeShare, prior.overallVolumeShare),
        avgPriceBrand: pctChange(current.avgPriceBrand, prior.avgPriceBrand),
        priceGapPct: pctChange(current.priceGapPct, prior.priceGapPct),
    };
}

export function useCompetitiveData(activeFilters: Record<string, string>) {
    const [currentCategories, setCurrentCategories] = useState<CompetitiveCategory[]>([]);
    const [priorCategories, setPriorCategories] = useState<CompetitiveCategory[]>([]);
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
            setCurrentCategories([]);
            setPriorCategories([]);
            setInsights([]);
            setLoading(false);
            setLoadingInsights(false);
            return;
        }

        let cancelled = false;

        const fetchData = () => {
            setLoading(true);
            setLoadingInsights(true);
            setCurrentCategories([]);
            setPriorCategories([]);
            setInsights([]);
            
            const params: FilterParams & { brand: string } = {
                brand,
                ...Object.fromEntries(
                    Object.entries(activeFilters).filter(([, v]) => v !== "")
                ),
            };
            if (days > 0) params.days = days;

            competitiveService.getAllWithPrior(params)
                .then(data => {
                    if (cancelled) return;
                    setCurrentCategories(data?.current || []);
                    setPriorCategories(data?.prior || []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching competitive data:", err);
                    if (cancelled) return;
                    setCurrentCategories([]);
                    setPriorCategories([]);
                    setLoading(false);
                });

            competitiveService.getInsights(params)
                .then(data => {
                    if (cancelled) return;
                    setInsights(data || []);
                    setLoadingInsights(false);
                })
                .catch(() => {
                    if (cancelled) return;
                    setInsights([]);
                    setLoadingInsights(false);
                });
        };

        fetchData();
        return () => { cancelled = true; };
    }, [activeFilters, days, brand]);

    const stats = useMemo(() => {
        if (!currentCategories.length) return null;

        const currentKpis = computeKpis(currentCategories);
        const priorKpis = priorCategories.length ? computeKpis(priorCategories) : currentKpis;
        const deltas = computeDeltas(currentKpis, priorKpis);

        const detailByCategory = currentCategories
            .map((c) => ({
            ...c,
            salesSharePct: c.salesShare * 100,
            volumeSharePct: c.volumeShare * 100,
            priceGapPct: c.averageBenchmarkPrice
                ? ((c.averageBrandPrice - c.averageBenchmarkPrice) / c.averageBenchmarkPrice) * 100
                : 0,
        }))
            .sort((a, b) => b.averageBrandPrice - a.averageBrandPrice);

        const salesShareByCategory = detailByCategory
            .map((r) => ({ category: r.category, sharePct: r.salesSharePct }))
            .sort((a, b) => b.sharePct - a.sharePct);
        const topCategories = [...detailByCategory].sort((a, b) => b.salesSharePct - a.salesSharePct).slice(0, 3);

        return {
            kpis: currentKpis,
            deltas,
            detailByCategory,
            salesShareByCategory,
            topCategories,
        };
    }, [currentCategories, priorCategories]);

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