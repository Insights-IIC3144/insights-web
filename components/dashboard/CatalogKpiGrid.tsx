import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Package, DollarSign, RotateCcw } from "lucide-react";

interface CatalogKpiGridProps {
  data: {
    totalProducts: number;
    totalRevenue: number;
    avgReturnRate: number;
  };
  loading: boolean;
}

export function CatalogKpiGrid({ data, loading }: CatalogKpiGridProps) {
  // Helpers para dar formato
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  
  const formatPercent = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label="Total de Productos"
        value={loading ? "..." : data.totalProducts.toString()}
        icon={<Package className="h-4 w-4 text-brand-blue" />}
      />
      <KpiCard
        label="Ingreso Total del Catálogo"
        value={loading ? "..." : formatCurrency(data.totalRevenue)}
        icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
      />
      <KpiCard
        label="Tasa Promedio de Devolución"
        value={loading ? "..." : formatPercent(data.avgReturnRate)}
        icon={<RotateCcw className="h-4 w-4 text-rose-400" />}
        delta={data.avgReturnRate > 0.15 ? -2.1 : undefined}
      />
    </div>
  );
}
