import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Users, Package } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesKpi } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";

interface SalesPrior {
  revenueNet: number;
  totalOrders: number;
  unitsSold: number;
  uniqueCustomers: number;
  lossRate: number;
  aov: number;
}

interface Props {
  data: SalesKpi[];
  prior?: SalesPrior | null;
  loading: boolean;
}

export function SalesKpiGrid({ data, prior, loading }: Props) {
  const revenueNet      = data.reduce((s, d) => s + (d.revenueNet      || 0), 0);
  const revenueGross    = data.reduce((s, d) => s + (d.revenueGross    || 0), 0);
  const totalOrders     = data.reduce((s, d) => s + (d.totalOrders     || 0), 0);
  const unitsSold       = data.reduce((s, d) => s + (d.unitsSold       || 0), 0);
  const uniqueCustomers = data.reduce((s, d) => s + (d.uniqueCustomers || 0), 0);
  const totalReturned = data.reduce((s, d) => s + (d.returnedItems || 0), 0);
  const totalItems = data.reduce((s, d) => s + (d.totalItems || 0), 0);
  const lossRate = totalItems > 0 ? totalReturned / totalItems : 0;
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
        value={revenueNet}
        format={fmtMoney}
        prior={prior?.revenueNet}
        hint={`Bruto: ${fmtMoney(revenueGross)}`}
        icon={<DollarSign className="h-4 w-4" />}
        tooltip="Ingresos generados por la marca después de descartar devoluciones y cancelaciones. Es el valor neto realmente percibido por las ventas del período."
      />
      <KpiCard
        label="Total Pedidos"
        value={totalOrders}
        format={fmtNum}
        prior={prior?.totalOrders}
        hint=""
        icon={<ShoppingCart className="h-4 w-4" />}
        tooltip="Número total de pedidos realizados en el período. Cada pedido puede contener uno o más productos."
      />
      <KpiCard
        label="Tasa de Pérdida"
        value={lossRate}
        format={(v) => `${((v ?? 0) * 100).toFixed(1)}%`}
        prior={prior?.lossRate}
        hint=""
        icon={<AlertTriangle className="h-4 w-4" />}
        tooltip="Porcentaje de ítems devueltos o cancelados respecto al total de pedidos. Una tasa alta puede indicar problemas con la calidad del producto o el proceso de venta."
      />
      <KpiCard
        label="Ticket Promedio"
        value={aov}
        format={fmtMoney}
        prior={prior?.aov}
        hint=""
        icon={<TrendingUp className="h-4 w-4" />}
        tooltip="Ingreso neto promedio por pedido. Se obtiene dividiendo los ingresos netos totales entre el número de pedidos del período."
      />
      <KpiCard
        label="Clientes Únicos"
        value={uniqueCustomers}
        format={fmtNum}
        prior={prior?.uniqueCustomers}
        hint=""
        icon={<Users className="h-4 w-4" />}
        tooltip="Cantidad de clientes distintos que realizaron al menos una compra en el período. Excluye compras repetidas del mismo cliente."
      />
      <KpiCard
        label="Unidades Vendidas"
        value={unitsSold}
        format={fmtNum}
        prior={prior?.unitsSold}
        hint=""
        icon={<Package className="h-4 w-4" />}
        tooltip="Total de unidades físicas vendidas en el período, sin considerar devoluciones ni cancelaciones. Un pedido puede contener múltiples unidades."
      />
    </div>
  );
}