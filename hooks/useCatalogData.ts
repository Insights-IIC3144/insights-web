import { useState, useEffect, useRef } from "react";
import { AiInsightDto, GlobalKpiDto } from "@/types/catalog";
import { useUserContext } from "@/context/UserContext";
import { catalogService } from "@/services/catalogService";
import { revalidateCatalogInsights } from "@/app/actions/catalogInsights";

export function useCatalogData(localFilters: Record<string, string>) {
  const { selectedBrand: brand, days } = useUserContext();

  const [insights, setInsights] = useState<AiInsightDto[]>([]);
  const insightsRef = useRef<AiInsightDto[]>([]);

  useEffect(() => {
    insightsRef.current = insights;
  }, [insights]);
  
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const [globalKpis, setGlobalKpis] = useState<GlobalKpiDto>({
    totalProducts: 0,
    totalRevenue: 0,
    avgReturnRate: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchAllData() {
      if (!days) return;

      setLoadingKpis(true);
      setLoadingInsights(true);
      setInsights([]);

      const params = {
        days,
        brand: brand === "" ? "all" : brand,
        category: localFilters.category,
        department: localFilters.department,
      };

      catalogService.getGlobalKpis(params)
        .then(kpis => {
          if (cancelled) return;
          setGlobalKpis(kpis);
          setLoadingKpis(false);
        })
        .catch(err => {
          console.error("Error fetching catalog KPIs:", err);
          if (!cancelled) {
            setGlobalKpis({ totalProducts: 0, totalRevenue: 0, avgReturnRate: 0 });
            setLoadingKpis(false);
          }
        });

      fetchInsightsData(params, cancelled);
    }

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [brand, days, localFilters]);

  const refetchInsights = async () => {
    if (!days) return;
    setLoadingInsights(true);
    setInsights([]);
    const effectiveBrand = brand === "" ? "all" : brand;
    const params = {
      days,
      brand: effectiveBrand,
      category: localFilters.category,
      department: localFilters.department,
    };
    await revalidateCatalogInsights(effectiveBrand, localFilters.category || "", days?.toString() || "");
    catalogService.getInsights(params)
      .then(fetchedInsights => {
        setInsights(fetchedInsights);
        setLoadingInsights(false);
      })
      .catch(err => {
        console.error("Error fetching catalog insights:", err);
        setInsights([]);
        setLoadingInsights(false);
      });
  };

  const fetchInsightsData = (params: any, cancelled: boolean) => {
    catalogService.getInsights(params)
      .then(fetchedInsights => {
        if (cancelled) return;
        setInsights(fetchedInsights);
        setLoadingInsights(false);
      })
      .catch(err => {
        console.error("Error fetching catalog insights:", err);
        if (!cancelled) {
          setInsights([]);
          setLoadingInsights(false);
        }
      });
  };

  const replaceInsight = async (oldInsightId: string, excludeType?: string) => {
    if (!days) throw new Error("Faltan días de filtro");
    const excludeTitles = insightsRef.current.map(i => i.title);
    const params = {
      days,
      brand: brand === "" ? "all" : brand,
      category: localFilters.category,
      department: localFilters.department,
    };
    try {
      const newInsights = await catalogService.regenerateInsight(params, excludeTitles, excludeType);
      if (newInsights && newInsights.length > 0) {
        setInsights(prev => prev.map(i => i.id === oldInsightId ? { ...newInsights[0], id: oldInsightId } : i));
      }
    } catch (err) {
      console.error("Error regenerating insight:", err);
      throw err;
    }
  };

  return {
    insights,
    kpis: globalKpis,
    loadingKpis,
    loadingInsights,
    refetchInsights,
    replaceInsight,
  };
}
