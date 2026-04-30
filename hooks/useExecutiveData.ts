import { useState, useEffect } from "react";
import { executiveService } from "@/services/executiveService";
import { ExecutiveKpi, CategorySales } from "@/types/executive";
import { FilterParams } from "@/types/shared";
import { useDashboard } from "@/context/DashboardContext";

export function useExecutiveData(activeFilters: Record<string, string>) {
  const [kpis, setKpis] = useState<ExecutiveKpi[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);
  const { days } = useDashboard();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: FilterParams = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== '')
        );
        if (days > 0) params.days = days;

        const [kpiRes, catRes] = await Promise.all([
          executiveService.getKpis(params),
          executiveService.getCategorySales(params)
        ]);
        
        if (kpiRes) setKpis(kpiRes);
        if (catRes) setCategorySales(catRes);
      } catch (err) {
        console.error("Error fetching executive data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilters, days]);

  return { kpis, categorySales, loading };
}
