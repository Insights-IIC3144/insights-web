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
    await catalogService.evictInsightsCache();
    catalogService.getInsights(params)
      .then(fetchedInsights => {
        const sorted = [...fetchedInsights].sort((a, b) => {
          const impactDiff = b.impactScore - a.impactScore;
          if (impactDiff !== 0) return impactDiff;
          return (a.title || "").localeCompare(b.title || "");
        });
        setInsights(sorted);
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
        const sorted = [...fetchedInsights].sort((a, b) => {
          const impactDiff = b.impactScore - a.impactScore;
          if (impactDiff !== 0) return impactDiff;
          return (a.title || "").localeCompare(b.title || "");
        });
        setInsights(sorted);
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
    const oldInsight = insightsRef.current.find(i => i.id === oldInsightId);
    if (oldInsight) {
      excludeTitles.push(`TEMA RECHAZADO ANTERIORMENTE (PROHIBIDO REPETIR ESTE PROBLEMA EXACTO): ${oldInsight.description}`);
    }
    const currentInsightsContext = insightsRef.current
      .filter(i => i.id !== oldInsightId)
      .map(i => `[Título: ${i.title}] - [Descripción: ${i.description}]`);

    const params = {
      days,
      brand: brand === "" ? "all" : brand,
      category: localCategory,
      department: localDepartment,
    };
    try {
      const newInsights = await catalogService.regenerateInsight(params, excludeTitles, excludeType, currentInsightsContext);
      if (newInsights && newInsights.length > 0) {
        const normalize = (s?: string | number) => (s ? String(s) : "").toLowerCase().trim();
        const currentAffectedStrings = new Set(
          insightsRef.current.flatMap(i => i.affectedItems?.flatMap(a => [normalize(a.id), normalize(a.name)]) || [])
        );
        currentAffectedStrings.delete("");

        let trulyNewInsight = newInsights.find(newInsight => {
          const hasNewTitle = !insightsRef.current.some(existing => existing.title === newInsight.title);
          const hasDifferentItems = !(newInsight.affectedItems?.some(a => 
             currentAffectedStrings.has(normalize(a.id)) || currentAffectedStrings.has(normalize(a.name))
          ));
          return hasNewTitle && hasDifferentItems;
        });

        if (!trulyNewInsight) {
          trulyNewInsight = newInsights.find(
            newInsight => !insightsRef.current.some(existing => existing.title === newInsight.title)
          );
        }

        if (!trulyNewInsight) {
          trulyNewInsight = newInsights[0];
        }

        setInsights(prev => prev.map(i => i.id === oldInsightId ? { ...trulyNewInsight, id: oldInsightId } : i));
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
