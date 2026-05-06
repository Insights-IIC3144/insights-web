import { Panel } from "@/components/ui-extra/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { SalesKpi, SalesByCategory } from "@/types/sales";
import { fmtMoney } from "@/lib/format";
import { useState } from "react";

interface Props {
  kpis: SalesKpi[];
  categorySales: SalesByCategory[];
  loading: boolean;
}

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-elevated)",
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type Granularity = "daily" | "weekly" | "monthly" | "yearly";

function groupByGranularity(data: SalesKpi[], granularity: Granularity) {
  const map = new Map<string, number>();

  for (const k of data) {
    const date = new Date(k.date ?? "");
    let label = "";

    if (granularity === "daily") {
      label = k.date ?? "";
    } else if (granularity === "weekly") {
      // Lunes de la semana como label
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((day + 6) % 7));
      label = monday.toISOString().slice(0, 10);
    } else if (granularity === "monthly") {
      label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else if (granularity === "yearly") {
      label = String(date.getFullYear());
    }

    map.set(label, (map.get(label) ?? 0) + (k.revenueNet ?? 0));
  }

  return Array.from(map.entries())
    .map(([label, revenue]) => ({ label, revenue }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "daily",   label: "Diario" },
  { value: "weekly",  label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly",  label: "Anual" },
];

export function SalesCharts({ kpis, categorySales, loading }: Props) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const trendData = groupByGranularity(kpis, granularity);

  const catData = categorySales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

      {/* VENTAS EN EL TIEMPO */}
      <Panel className="col-span-4 lg:col-span-5" title="Ventas en el Tiempo">

        {/* Selector de granularidad */}
        <div className="flex gap-1 mb-4">
          {GRANULARITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGranularity(opt.value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                granularity === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => fmtMoney(v)} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [fmtMoney(v), "Ingresos netos"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--chart-1))"
                fill="url(#revenueGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      {/* VENTAS POR CATEGORÍA */}
      <Panel className="col-span-3 lg:col-span-2" title="Ventas por Categoría">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={catData}
                dataKey="revenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {catData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [fmtMoney(v), "Ingresos"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Panel>

    </div>
  );
}