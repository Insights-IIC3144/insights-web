import { useState, useEffect, useRef } from "react";
import { AiInsightDto, GlobalKpiDto } from "@/types/catalog";
import { useUserContext } from "@/context/UserContext";
import { catalogService } from "@/services/catalogService";
import { revalidateCatalogInsights } from "@/app/actions/catalogInsights";

export function useCatalogData(localFilters: Record<string, string>) {
  const { category: localCategory, department: localDepartment } = localFilters;
  const { selectedBrand: brand, days } = useUserContext();

  const [insights, setInsights] = useState<AiInsightDto[]>([]);
  const insightsRef = useRef<AiInsightDto[]>([]);

  useEffect(() => {
    insightsRef.current = insights;
  }, [insights]);
  
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const [globalKpis, setGlobalKpis] = useState<GlobalKpiDto | null>(null);

  const [globalKpisPrior, setGlobalKpisPrior] = useState<GlobalKpiDto | null>(null);

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
        category: localCategory,
        department: localDepartment,
      };

      catalogService.getKpisWithPrior(params)
        .then(data => {
          if (cancelled) return;
          const current = data.current?.[0] ?? null;
          const prior = data.prior?.[0] ?? null;
          setGlobalKpis(current);
          setGlobalKpisPrior(prior);
          setLoadingKpis(false);
        })
        .catch(err => {
          console.error("Error fetching catalog KPIs:", err);
          if (!cancelled) {
            setGlobalKpis(null);
            setGlobalKpisPrior(null);
            setLoadingKpis(false);
          }
        });

      fetchInsightsData(params, cancelled);
    }

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [brand, days, localCategory, localDepartment]);

  const refetchInsights = async () => {
    if (!days) return;
    setLoadingInsights(true);
    setInsights([]);
    const effectiveBrand = brand === "" ? "all" : brand;
    const params = {
      days,
      brand: effectiveBrand,
      category: localCategory,
      department: localDepartment,
    };
    await revalidateCatalogInsights(effectiveBrand, localCategory || "", days?.toString() || "");
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
      category: localCategory,
      department: localDepartment,
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
    kpisPrior: globalKpisPrior,
    loadingKpis,
    loadingInsights,
    refetchInsights,
    replaceInsight,
  };
}
