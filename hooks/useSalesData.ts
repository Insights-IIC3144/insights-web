import { useState, useEffect } from "react";
import { salesService } from "@/services/salesService";
import { SalesKpi, SalesByCategory, SalesPerformanceByDimension, TopProductsData } from "@/types/sales";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

export function useSalesData(
  activeFilters: Record<string, string>,
  granularity: string = "monthly",
  topLimit: number = 5
) {
  const [kpis, setKpis] = useState<SalesKpi[]>([]);
  const [categorySales, setCategorySales] = useState<SalesByCategory[]>([]);
  const [performance, setPerformance] = useState<SalesPerformanceByDimension[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { days, selectedBrand: brand } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: FilterParams = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== "")
        );
        if (days > 0) params.days = days;
        if (brand) params.brand = brand;
        params.granularity = granularity;

        const [kpiRes, catRes, perfRes, topRes] = await Promise.all([
          salesService.getKpis(params),
          salesService.getCategorySales(params),
          salesService.getPerformance(params),
          salesService.getTopProducts({ ...params, limit: topLimit }),
        ]);

        if (kpiRes) setKpis(kpiRes);
        if (catRes) setCategorySales(catRes);
        if (perfRes) setPerformance(perfRes);
        if (topRes) setTopProducts(topRes);
      } catch (err) {
        console.error("Error fetching sales data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilters, days, brand, granularity, topLimit]);

  return { kpis, categorySales, performance, topProducts, loading };
}
