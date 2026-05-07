import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Users, Package } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesKpi } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";

interface Props {
  data: SalesKpi[];
  loading: boolean;
}

export function SalesKpiGrid({ data, loading }: Props) {
  const revenueNet      = data.reduce((s, d) => s + (d.revenueNet      || 0), 0);
  const revenueGross    = data.reduce((s, d) => s + (d.revenueGross    || 0), 0);
  const totalOrders     = data.reduce((s, d) => s + (d.totalOrders     || 0), 0);
  const unitsSold       = data.reduce((s, d) => s + (d.unitsSold       || 0), 0);
  const uniqueCustomers = data.reduce((s, d) => s + (d.uniqueCustomers || 0), 0);
  const lossRate        = data.length > 0 ? data[data.length - 1].lossRate : 0;
  const aov             = totalOrders > 0 ? revenueNet / totalOrders : 0;

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Ingresos Netos"
        value={fmtMoney(revenueNet)}
        hint={`Bruto: ${fmtMoney(revenueGross)}`}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <KpiCard
        label="Total Pedidos"
        value={fmtNum(totalOrders)}
        hint=""
        icon={<ShoppingCart className="h-4 w-4" />}
      />
      <KpiCard
        label="Tasa de Pérdida"
        value={`${((lossRate ?? 0) * 100).toFixed(1)}%`}
        hint=""
        icon={<AlertTriangle className="h-4 w-4" />}
      />
      <KpiCard
        label="Ticket Promedio"
        value={fmtMoney(aov)}
        hint=""
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <KpiCard
        label="Clientes Únicos"
        value={fmtNum(uniqueCustomers)}
        hint=""
        icon={<Users className="h-4 w-4" />}
      />
      <KpiCard
        label="Unidades Vendidas"
        value={fmtNum(unitsSold)}
        hint=""
        icon={<Package className="h-4 w-4" />}
      />
    </div>
  );
}