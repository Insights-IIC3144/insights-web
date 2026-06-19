import { useState, useEffect, useRef } from "react";
import { CatalogProductDto, AiInsightDto } from "@/types/catalog";
import { useUserContext } from "@/context/UserContext";
import { catalogService } from "@/services/catalogService";
import { revalidateCatalogInsights } from "@/app/actions/catalogInsights";

export function useCatalogData(localFilters: Record<string, string>) {
  // Global context filters (from Topbar)
  const { selectedBrand: brand, days } = useUserContext();

  const [products, setProducts] = useState<CatalogProductDto[]>([]);
  const [insights, setInsights] = useState<AiInsightDto[]>([]);
  const insightsRef = useRef<AiInsightDto[]>([]);

  useEffect(() => {
    insightsRef.current = insights;
  }, [insights]);
  
  // Estados de carga separados según el contrato
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // KPIs calculados
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgReturnRate, setAvgReturnRate] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchAllData() {
      if (!days) return; // Esperar a tener el contexto de tiempo

      setLoadingProducts(true);
      setLoadingInsights(true);
      setProducts([]);
      setInsights([]);

      const params = {
        days,
        brand: brand === "" ? "all" : brand, // si brand está vacío, asumimos "all"
        category: localFilters.category,
        department: localFilters.department,
      };

      // Disparar promesa de productos
      catalogService.getProducts(params)
        .then(fetchedProducts => {
          if (cancelled) return;
          
          setProducts(fetchedProducts);

          // Calcular KPIs
          const total = fetchedProducts.length;
          const revenue = fetchedProducts.reduce((acc, curr) => acc + (curr.revenueNet || 0), 0);
          const returnRate = total > 0 
            ? fetchedProducts.reduce((acc, curr) => acc + (curr.returnRate || 0), 0) / total 
            : 0;

          setTotalProducts(total);
          setTotalRevenue(revenue);
          setAvgReturnRate(returnRate);
          
          setLoadingProducts(false);
        })
        .catch(err => {
          console.error("Error fetching catalog products:", err);
          if (!cancelled) {
            setProducts([]);
            setLoadingProducts(false);
          }
        });

      // Disparar promesa de insights en paralelo (puede tardar más)
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
    await revalidateCatalogInsights(effectiveBrand, localFilters.category || "");
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
      throw err; // Let the component handle the error state
    }
  };

  return {
    products,
    insights,
    kpis: {
      totalProducts,
      totalRevenue,
      avgReturnRate,
    },
    loadingProducts,
    loadingInsights,
    refetchInsights,
    replaceInsight,
  };
}
