import { DollarSign, ShoppingBag, Package, Users, ReceiptText } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtMoney, fmtNum } from "@/lib/format";

interface ExecutiveKpiAggregated {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  uniqueCustomers: number;
  aov: number;
}

interface Props {
  data: ExecutiveKpiAggregated | null;
  prior?: ExecutiveKpiAggregated | null;
  loading: boolean;
}

export function ExecutiveKpiGrid({ data, prior, loading }: Props) {
  const { totalRevenue = 0, totalOrders = 0, totalUnits = 0, uniqueCustomers = 0, aov = 0 } = data ?? {};

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
        value={totalRevenue}
        format={fmtMoney}
        prior={prior?.totalRevenue}
        icon={<DollarSign className="h-4 w-4" />}
        tooltip="Ingresos netos acumulados de la marca en el período, excluyendo devoluciones y cancelaciones." />
      <KpiCard
        label="Órdenes"
        value={totalOrders}
        format={fmtNum}
        prior={prior?.totalOrders}
        icon={<ShoppingBag className="h-4 w-4" />}
        tooltip="Cantidad de pedidos realizados en el período. Un pedido puede agrupar múltiples productos." />
      <KpiCard
        label="Unidades vendidas"
        value={totalUnits}
        format={fmtNum}
        prior={prior?.totalUnits}
        icon={<Package className="h-4 w-4" />}
        tooltip="Total de unidades físicas comercializadas. Una misma orden puede contener varias unidades." />
      <KpiCard
        label="Clientes únicos"
        value={uniqueCustomers}
        format={fmtNum}
        prior={prior?.uniqueCustomers}
        icon={<Users className="h-4 w-4" />}
        tooltip="Número de clientes distintos que efectuaron al menos una compra en el período." />
      <KpiCard
        label="Ticket promedio"
        value={aov}
        format={fmtMoney}
        prior={prior?.aov}
        icon={<ReceiptText className="h-4 w-4" />}
        tooltip="Valor promedio gastado por pedido. Se calcula dividiendo las ventas totales entre el número de órdenes." />
    </div>
  );
}
