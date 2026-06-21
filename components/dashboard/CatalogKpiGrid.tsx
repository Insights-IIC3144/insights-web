import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, DollarSign, RotateCcw } from "lucide-react";
import { fmtMoney } from "@/lib/format";

interface CatalogKpiGridProps {
  data: {
    totalProducts: number;
    totalRevenue: number;
    avgReturnRate: number;
  } | null;
  prior?: {
    totalProducts: number;
    totalRevenue: number;
    avgReturnRate: number;
  } | null;
  loading: boolean;
}

export function CatalogKpiGrid({ data, prior, loading }: CatalogKpiGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const formatPercent = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        label="Total de Productos"
        value={data?.totalProducts}
        format={(v) => v.toString()}
        prior={prior?.totalProducts}
        icon={<Package className="h-4 w-4 text-primary" />}
        tooltip="Número total de productos en el catálogo."
      />
      <KpiCard
        label="Ingreso Total del Catálogo"
        value={data?.totalRevenue}
        format={(v) => fmtMoney(v)}
        prior={prior?.totalRevenue}
        icon={<DollarSign className="h-4 w-4 text-emerald-400" />}
        tooltip="Suma de ingresos generados por las ventas del catálogo en el período."
      />
      <KpiCard
        label="Tasa Promedio de Devolución"
        value={data?.avgReturnRate}
        format={formatPercent}
        prior={prior?.avgReturnRate}
        icon={<RotateCcw className="h-4 w-4 text-rose-400" />}
        tooltip="Porcentaje de unidades devueltas respecto al total de unidades vendidas. Una tasa alta puede indicar problemas de calidad o expectativas incorrectas del producto."
      />
    </div>
  );
}
