import { useState, useEffect, useMemo } from "react";
import { competitiveService } from "@/services/competitiveService";
import { CompetitiveCategory, CompetitiveWithPrior, CompetitiveInsightDto } from "@/types/competitive";
import { useUserContext } from "@/context/UserContext";
import { FilterParams } from "@/types/shared";

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
        overallSalesShare: current.overallSalesShare - prior.overallSalesShare,
        overallVolumeShare: current.overallVolumeShare - prior.overallVolumeShare,
        avgPriceBrand:
            prior.avgPriceBrand !== 0
                ? ((current.avgPriceBrand - prior.avgPriceBrand) / prior.avgPriceBrand) * 100
                : 0,
        priceGapPct: current.priceGapPct - prior.priceGapPct,
    };
}

export function useCompetitiveData(activeFilters: Record<string, string>) {
    const [currentCategories, setCurrentCategories] = useState<CompetitiveCategory[]>([]);
    const [priorCategories, setPriorCategories] = useState<CompetitiveCategory[]>([]);
    const [insights, setInsights] = useState<CompetitiveInsightDto[]>([]);
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

        const detailByCategory = currentCategories.map((c) => ({
            ...c,
            salesSharePct: c.salesShare * 100,
            volumeSharePct: c.volumeShare * 100,
            priceGapPct: c.averageBenchmarkPrice
                ? ((c.averageBrandPrice - c.averageBenchmarkPrice) / c.averageBenchmarkPrice) * 100
                : 0,
        }));

        const salesShareByCategory = detailByCategory.map((r) => ({ category: r.category, sharePct: r.salesSharePct }));
        const topCategories = [...detailByCategory].sort((a, b) => b.salesSharePct - a.salesSharePct).slice(0, 3);

        return {
            kpis: currentKpis,
            deltas,
            detailByCategory,
            salesShareByCategory,
            topCategories,
        };
    }, [currentCategories, priorCategories]);

    return { loading, loadingInsights, insights, stats };
}