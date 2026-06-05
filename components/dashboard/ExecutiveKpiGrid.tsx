import { DollarSign, ShoppingBag, Package, Users, ReceiptText } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ExecutiveKpi } from "@/types/executive";

import { fmtMoney, fmtNum } from "@/lib/format";

interface ExecutiveDeltas {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  uniqueCustomers: number;
  aov: number;
}

interface Props {
  data: ExecutiveKpi[];
  deltas?: ExecutiveDeltas | null;
  loading: boolean;
}

export function ExecutiveKpiGrid({ data, deltas, loading }: Props) {
  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders = data.reduce((s, d) => s + (d.totalOrders || 0), 0);
  const totalUnits = data.reduce((s, d) => s + (d.unitsSold || 0), 0);
  const uniqueCustomers = data.reduce((s, d) => s + (d.uniqueCustomers || 0), 0);
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Ventas totales"
        value={fmtMoney(totalRevenue)}
        delta={deltas?.totalRevenue}
        icon={<DollarSign className="h-4 w-4" />}
        tooltip="Ingresos netos acumulados de la marca en el período, excluyendo devoluciones y cancelaciones." />
      <KpiCard
        label="Órdenes"
        value={fmtNum(totalOrders)}
        delta={deltas?.totalOrders}
        icon={<ShoppingBag className="h-4 w-4" />}
        tooltip="Cantidad de pedidos realizados en el período. Un pedido puede agrupar múltiples productos." />
      <KpiCard
        label="Unidades vendidas"
        value={fmtNum(totalUnits)}
        delta={deltas?.totalUnits}
        icon={<Package className="h-4 w-4" />}
        tooltip="Total de unidades físicas comercializadas. Una misma orden puede contener varias unidades." />
      <KpiCard
        label="Clientes únicos"
        value={fmtNum(uniqueCustomers)}
        delta={deltas?.uniqueCustomers}
        icon={<Users className="h-4 w-4" />}
        tooltip="Número de clientes distintos que efectuaron al menos una compra en el período." />
      <KpiCard
        label="Ticket promedio"
        value={fmtMoney(aov)}
        delta={deltas?.aov}
        icon={<ReceiptText className="h-4 w-4" />}
        tooltip="Valor promedio gastado por pedido. Se calcula dividiendo las ventas totales entre el número de órdenes." />
    </div>
  );
}
