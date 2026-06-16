"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui-extra/InfoTooltip";
import { AudiencesRfm } from "@/types/audiences";
import { fmtMoney } from "@/lib/format";

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

interface BubbleProps {
  cx?: number;
  cy?: number;
  payload?: AudiencesRfm;
}

function BubbleShape({ cx = 0, cy = 0, payload }: BubbleProps) {
  const r = payload ? Math.max(4, Math.sqrt(payload.avgTicket) * 0.8) : 6;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="hsl(var(--chart-1))"
      fillOpacity={0.6}
      stroke="hsl(var(--chart-1))"
      strokeOpacity={0.9}
      strokeWidth={1}
    />
  );
}

interface Props {
  data: AudiencesRfm[];
  loading: boolean;
}

export function RfmBubbleChart({ data, loading }: Props) {
  if (loading) {
    return <Skeleton className="h-72 rounded-lg" />;
  }

  return (
    <div className="panel">
      <div className="panel-header flex items-center gap-1.5">
        <div className="font-semibold text-sm">Recencia × Frecuencia</div>
        <InfoTooltip text="Cada burbuja es un grupo de clientes con la misma recencia (días desde su última compra). El eje Y muestra cuántas veces compran y el tamaño refleja su ticket promedio. Burbujas grandes arriba a la izquierda = clientes de mayor valor." direction="left" />
      </div>
      <div className="panel-body">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="recencyDays"
              name="Recencia"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}d`}
            />
            <YAxis
              dataKey="avgFrequency"
              name="Frecuencia"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(value: number, name: string) => {
                if (name === "Recencia") return [`${value}d`, name];
                if (name === "Frecuencia") return [value.toFixed(1), name];
                return [fmtMoney(value), "Ticket Prom."];
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as AudiencesRfm;
                return (
                  <div style={TOOLTIP_STYLE} className="p-2 space-y-0.5">
                    <div>Recencia: <strong>{d.recencyDays}d</strong></div>
                    <div>Frecuencia: <strong>{d.avgFrequency.toFixed(1)}</strong></div>
                    <div>Ticket prom: <strong>{fmtMoney(d.avgTicket)}</strong></div>
                    <div>Clientes: <strong>{d.customerCount}</strong></div>
                  </div>
                );
              }}
            />
            <Scatter data={data} shape={<BubbleShape />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
