import { useState, useEffect } from "react";
import { salesService } from "@/services/salesService";
import { SalesKpi, SalesKpisWithPrior, SalesByCategory, SalesPerformanceByDimension } from "@/types/sales";
import { FilterParams } from "@/types/shared";
import { useUserContext } from "@/context/UserContext";

function aggregateKpis(data: SalesKpi[]) {
  const revenueNet = data.reduce((sum, d) => sum + (d.revenueNet || 0), 0);
  const totalOrders = data.reduce((sum, d) => sum + (d.totalOrders || 0), 0);
  const unitsSold = data.reduce((sum, d) => sum + (d.unitsSold || 0), 0);
  const uniqueCustomers = data.reduce((sum, d) => sum + (d.uniqueCustomers || 0), 0);
  // TODO: evaluate if lossRate should be aggregated differently (e.g. average)
  const lossRate = data.length > 0 ? data[data.length - 1].lossRate : 0;
  const aov = totalOrders > 0 ? revenueNet / totalOrders : 0;
  return { revenueNet, totalOrders, unitsSold, uniqueCustomers, lossRate, aov };
}

function computeDeltas(
  current: ReturnType<typeof aggregateKpis>,
  prior: ReturnType<typeof aggregateKpis>
) {
  return {
    revenueNet: prior.revenueNet !== 0
      ? ((current.revenueNet - prior.revenueNet) / prior.revenueNet) * 100 : 0,
    totalOrders: prior.totalOrders !== 0
      ? ((current.totalOrders - prior.totalOrders) / prior.totalOrders) * 100 : 0,
    unitsSold: prior.unitsSold !== 0
      ? ((current.unitsSold - prior.unitsSold) / prior.unitsSold) * 100 : 0,
    uniqueCustomers: prior.uniqueCustomers !== 0
      ? ((current.uniqueCustomers - prior.uniqueCustomers) / prior.uniqueCustomers) * 100 : 0,
    lossRate: (current.lossRate - prior.lossRate) * 100,
    aov: prior.aov !== 0
      ? ((current.aov - prior.aov) / prior.aov) * 100 : 0,
  };
}

export function useSalesData(
  activeFilters: Record<string, string>,
  granularity: string = "monthly"
) {
  const [kpis, setKpis] = useState<SalesKpi[]>([]);
  const [deltas, setDeltas] = useState<ReturnType<typeof computeDeltas> | null>(null);
  const [categorySales, setCategorySales] = useState<SalesByCategory[]>([]);
  const [performance, setPerformance] = useState<SalesPerformanceByDimension[]>([]);
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

        const [kpiRes, catRes, perfRes] = await Promise.all([
          salesService.getKpisWithPrior(params),
          salesService.getCategorySales(params),
          salesService.getPerformance(params),
        ]);

        if (kpiRes) {
          const data = kpiRes as SalesKpisWithPrior;
          setKpis(data.current || []);
          const currentAgg = aggregateKpis(data.current || []);
          const priorAgg = data.prior?.length ? aggregateKpis(data.prior) : currentAgg;
          setDeltas(computeDeltas(currentAgg, priorAgg));
        }
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

  return { kpis, deltas, categorySales, performance, loading };
}