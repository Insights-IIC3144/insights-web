import { DollarSign, ShoppingBag, TrendingUp, Hash } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesDailyKpi } from "@/types/sales";

import { fmtMoney, fmtNum } from "@/lib/format";

interface Props {
  data: SalesDailyKpi[];
  loading: boolean;
}

export function SalesKpiGrid({ data, loading }: Props) {
  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders = data.reduce((s, d) => s + (d.orders || 0), 0);
  const totalUnits = data.reduce((s, d) => s + (d.unitsSold || 0), 0);
  
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const upt = totalOrders > 0 ? totalUnits / totalOrders : 0;
  const asp = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Ticket Promedio (AOV)" value={fmtMoney(aov)} delta={0} hint="revenue / órdenes" icon={<TrendingUp className="h-4 w-4" />} />
      <KpiCard label="Unidades por Orden (UPT)" value={fmtNum(upt)} delta={0} hint="unidades / órdenes" icon={<ShoppingBag className="h-4 w-4" />} />
      <KpiCard label="Precio Promedio (ASP)" value={fmtMoney(asp)} delta={0} hint="revenue / unidades" icon={<DollarSign className="h-4 w-4" />} />
      <KpiCard label="Ingresos (Revenue)" value={fmtMoney(totalRevenue)} delta={0} hint="ingresos totales" icon={<Hash className="h-4 w-4" />} />
    </div>
  );
}
