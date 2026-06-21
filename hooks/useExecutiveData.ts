import { useState, useEffect } from "react";
import { executiveService } from "@/services/executiveService";
import { ExecutiveKpi, ExecutiveKpisWithPrior, CategorySales } from "@/types/executive";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

function aggregateKpis(data: ExecutiveKpi[]) {
  const totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.totalOrders || 0), 0);
  const totalUnits = data.reduce((sum, d) => sum + (d.unitsSold || 0), 0);
  const uniqueCustomers = data.reduce((sum, d) => sum + (d.uniqueCustomers || 0), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  return { totalRevenue, totalOrders, totalUnits, uniqueCustomers, aov };
}

export function useExecutiveData(activeFilters: Record<string, string>) {
  const [kpis, setKpis] = useState<ExecutiveKpi[]>([]);
  const [current, setCurrent] = useState<ReturnType<typeof aggregateKpis> | null>(null);
  const [prior, setPrior] = useState<ReturnType<typeof aggregateKpis> | null>(null);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);
  const { days, selectedBrand: brand } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: FilterParams = Object.fromEntries(
          Object.entries(activeFilters).filter(([, v]) => v !== '')
        );
        if (days > 0) params.days = days;
        if (brand) params.brand = brand;

        const [kpiRes, catRes] = await Promise.all([
          executiveService.getKpisWithPrior(params),
          executiveService.getCategorySales(params)
        ]);

        if (kpiRes) {
          const data = kpiRes as ExecutiveKpisWithPrior;
          setKpis(data.current || []);
          const currentAgg = aggregateKpis(data.current || []);
          const priorAgg = data.prior?.length ? aggregateKpis(data.prior) : currentAgg;
          setCurrent(currentAgg);
          setPrior(priorAgg);
        }
        if (catRes) setCategorySales(catRes);
      } catch (err) {
        console.error("Error fetching executive data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeFilters, days, brand]);

  return { kpis, current, prior, categorySales, loading };
}
