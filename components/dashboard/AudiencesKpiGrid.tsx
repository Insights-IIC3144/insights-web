"use client";

import { Users, RefreshCw, Clock, Receipt } from "lucide-react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNum, fmtMoney } from "@/lib/format";
import { AudiencesKpis } from "@/types/audiences";

interface Props {
  data: AudiencesKpis | null;
  loading: boolean;
}

export function AudiencesKpiGrid({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard
        label="Clientes Únicos"
        value={data?.uniqueCustomers}
        format={fmtNum}
        delta={data?.uniqueCustomersDeltaPct ?? undefined}
        icon={<Users className="h-4 w-4" />}
        tooltip="Compradores distintos en el período. El % compara los últimos 30 días vs los 30 anteriores."
      />
      <KpiCard
        label="Órdenes / Cliente"
        value={data?.ordersPerCustomer}
        format={(v) => v.toFixed(2)}
        delta={data?.ordersPerCustomerDeltaPct ?? undefined}
        hint="Frecuencia"
        icon={<RefreshCw className="h-4 w-4" />}
        tooltip="Promedio de órdenes por comprador. Valores sobre 1.5 indican buena retención y hábito de recompra."
      />
      <KpiCard
        label="Recencia Promedio"
        value={data?.avgRecencyDays}
        format={(v) => `${v} d`}
        delta={data?.avgRecencyDeltaPct ?? undefined}
        hint="Días desde última compra"
        icon={<Clock className="h-4 w-4" />}
        tooltip="Días desde la última compra de cada cliente, promediados. El % es positivo cuando la recencia mejora (baja)."
      />
      <KpiCard
        label="Ticket / Cliente"
        value={data?.avgTicketPerCustomer}
        format={fmtMoney}
        delta={data?.avgTicketDeltaPct ?? undefined}
        icon={<Receipt className="h-4 w-4" />}
        tooltip="Gasto promedio por orden. Refleja el valor monetario de la audiencia y su disposición a pagar."
      />
    </div>
  );
}
