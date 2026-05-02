import { useEffect, useState } from "react";
import { SalesKpi } from "@/types/sales";
import { api } from "@/lib/api"; // ajusta la ruta si es diferente

interface Filters {
  days?: number;
  category?: string;
  country?: string;
  [key: string]: string | number | undefined;
}

export function useSalesData(filters: Filters = {}) {
  const [kpis, setKpis] = useState<SalesKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const params: Record<string, string> = {};
    if (filters.days)     params.days     = String(filters.days);
    if (filters.category) params.category = filters.category;
    if (filters.country)  params.country  = filters.country;

    api.get<SalesKpi[]>("/sales/kpis", params)
      .then((data) => { setKpis(data); setLoading(false); })
      .catch(() => setLoading(false));

  }, [JSON.stringify(filters)]);

  return { kpis, loading };
}