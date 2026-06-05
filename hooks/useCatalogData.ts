import { useState, useEffect } from "react";
import { CatalogProductDto, AiInsightDto } from "@/types/catalog";
import { useUserContext } from "@/context/UserContext";
import { catalogService } from "@/services/catalogService";

export function useCatalogData(localFilters: Record<string, string>) {
  // Global context filters (from Topbar)
  const { selectedBrand: brand, days } = useUserContext();

  const [products, setProducts] = useState<CatalogProductDto[]>([]);
  const [insights, setInsights] = useState<AiInsightDto[]>([]);
  
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

  const refetchInsights = () => {
    if (!days) return;
    setLoadingInsights(true);
    const params = {
      days,
      brand: brand === "" ? "all" : brand,
      category: localFilters.category,
      department: localFilters.department,
    };
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
  };
}
