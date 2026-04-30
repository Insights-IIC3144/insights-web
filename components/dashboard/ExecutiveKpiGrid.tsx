import { DollarSign, ShoppingBag, Package, Users, ReceiptText } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ExecutiveKpi } from "@/types/executive";

import { fmtMoney, fmtNum } from "@/lib/format";

interface Props {
  data: ExecutiveKpi[];
  loading: boolean;
}

export function ExecutiveKpiGrid({ data, loading }: Props) {
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
      <KpiCard label="Ventas totales" value={fmtMoney(totalRevenue)} delta={0} hint="vs período anterior" icon={<DollarSign className="h-4 w-4" />} />
      <KpiCard label="Órdenes" value={fmtNum(totalOrders)} delta={0} hint="30d" icon={<ShoppingBag className="h-4 w-4" />} />
      <KpiCard label="Unidades vendidas" value={fmtNum(totalUnits)} delta={0} hint="30d" icon={<Package className="h-4 w-4" />} />
      <KpiCard label="Clientes únicos" value={fmtNum(uniqueCustomers)} delta={0} hint="30d" icon={<Users className="h-4 w-4" />} />
      <KpiCard label="Ticket promedio" value={fmtMoney(aov)} delta={0} hint="vs período anterior" icon={<ReceiptText className="h-4 w-4" />} />
    </div>
  );
}
