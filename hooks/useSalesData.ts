import { useState, useEffect } from "react";
import { salesService } from "@/services/salesService";
import { SalesKpi, SalesByCategory, SalesPerformanceByDimension } from "@/types/sales";
import { FilterParams } from "@/types/shared";
import { useDashboard } from "@/context/DashboardContext";

export function useSalesData(
  activeFilters: Record<string, string>,
  granularity: string = "monthly"
) {
  const [kpis, setKpis] = useState<SalesKpi[]>([]);
  const [categorySales, setCategorySales] = useState<SalesByCategory[]>([]);
  const [performance, setPerformance] = useState<SalesPerformanceByDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const { days, brand } = useDashboard();

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

        const [kpiRes, catRes, perfRes] = await Promise.all([
          salesService.getKpis(params),
          salesService.getCategorySales(params),
          salesService.getPerformance(params),
        ]);

        if (kpiRes) setKpis(kpiRes);
        if (catRes) setCategorySales(catRes);
        if (perfRes) setPerformance(perfRes);
      } catch (err) {
        console.error("Error fetching sales data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilters, days, brand, granularity]);

  return { kpis, categorySales, performance, loading };
}