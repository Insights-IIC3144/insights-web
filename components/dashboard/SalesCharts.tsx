import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { SalesKpi, SalesByCategory } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";

interface Props {
  kpis: SalesKpi[];
  categorySales: SalesByCategory[];
  loading: boolean;
  granularity: string;
  onGranularityChange: (g: string) => void;
}

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const GRANULARITY_OPTIONS = [
  { value: "daily",   label: "Diario" },
  { value: "weekly",  label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly",  label: "Anual" },
];

// Tarjeta base reutilizable con slot de header derecho opcional
function ChartCard({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {headerRight && <div className="flex gap-1">{headerRight}</div>}
      </div>
      {children}
    </div>
  );
}

export function SalesCharts({
  kpis,
  categorySales,
  loading,
  granularity,
  onGranularityChange,
}: Props) {
  const trendData = kpis.map((k) => ({
    label: k.date,
    revenue: k.revenueNet ?? 0,
    orders: k.totalOrders ?? 0,
    aov: k.avgOrderValue ?? 0,
  }));

  const catData = categorySales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const granularitySelector = (
    <>
      {GRANULARITY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onGranularityChange(opt.value)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            granularity === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* FILA 1 — Ventas en el tiempo (ancho completo) */}
      <ChartCard title="Ventas en el Tiempo" headerRight={granularitySelector}>
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
                contentStyle={TOOLTIP_STYLE}
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
      </ChartCard>

      {/* FILA 2 — Ticket promedio en el tiempo (ancho completo) */}
      <ChartCard title="Ticket Promedio en el Tiempo">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => fmtMoney(v)} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [fmtMoney(v), "Ticket promedio"]}
              />
              <Line
                type="monotone"
                dataKey="aov"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* FILA 3 — Dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Ventas por categoría */}
        <ChartCard title="Ventas por Categoría">
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
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number) => [fmtMoney(v), "Ingresos"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Órdenes vs Revenue */}
        <ChartCard title="Órdenes vs Revenue">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tickFormatter={(v) => fmtMoney(v)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="orders"
                  orientation="right"
                  tickFormatter={(v) => fmtNum(v)}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string) =>
                    name === "revenue"
                      ? [fmtMoney(v), "Revenue neto"]
                      : [fmtNum(v), "Órdenes"]
                  }
                />
                <Legend />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill="hsl(var(--chart-1))"
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                  name="revenue"
                />
                <Line
                  yAxisId="orders"
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                  name="orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>
    </div>
  );
}