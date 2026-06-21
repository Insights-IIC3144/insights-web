import { useState, useEffect } from "react";
import { salesService } from "@/services/salesService";
import { SalesKpi, SalesKpisWithPrior, SalesByCategory, SalesPerformanceByDimension, TopProductsData } from "@/types/sales";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

function aggregateKpis(data: SalesKpi[]) {
  const revenueNet = data.reduce((sum, d) => sum + (d.revenueNet || 0), 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.totalOrders || 0), 0);
  const unitsSold = data.reduce((sum, d) => sum + (d.unitsSold || 0), 0);
  const uniqueCustomers = data.reduce((sum, d) => sum + (d.uniqueCustomers || 0), 0);
  const totalReturned = data.reduce((sum, d) => sum + (d.returnedItems || 0), 0);
  const totalItems = data.reduce((sum, d) => sum + (d.totalItems || 0), 0);
  const lossRate = totalItems > 0 ? totalReturned / totalItems : 0;
  const aov = totalOrders > 0 ? revenueNet / totalOrders : 0;
  return { revenueNet, totalOrders, unitsSold, uniqueCustomers, lossRate, aov };
}

export function useSalesData(
  activeFilters: Record<string, string>,
  granularity: string = "monthly",
  topLimit: number = 5
) {
  const [kpis, setKpis] = useState<SalesKpi[]>([]);
  const [prior, setPrior] = useState<ReturnType<typeof aggregateKpis> | null>(null);
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
          salesService.getKpisWithPrior(params),
          salesService.getCategorySales(params),
          salesService.getPerformance(params),
          salesService.getTopProducts({ ...params, limit: topLimit }),
        ]);

        if (kpiRes) {
          const data = kpiRes as SalesKpisWithPrior;
          setKpis(data.current || []);
          const currentAgg = aggregateKpis(data.current || []);
          const priorAgg = data.prior?.length ? aggregateKpis(data.prior) : currentAgg;
          setPrior(priorAgg);
        }
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

  return { kpis, prior, categorySales, performance, topProducts, loading };
}
