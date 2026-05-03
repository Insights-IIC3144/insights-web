import { Panel } from "@/components/ui-extra/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { SalesDailyKpi, SalesByCategory } from "@/types/sales";
import { fmtMoney } from "@/lib/format";

interface Props {
  kpis: SalesDailyKpi[];
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

export function SalesCharts({ kpis, categorySales, loading }: Props) {
  const trendData = kpis.map(k => ({
    label: k.date,
    revenue: k.revenue
  })).sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

  // categorySales comes directly grouped from the backend now
  const catData = categorySales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Panel className="lg:col-span-2" title="Ventas en el Tiempo" description="Revenue diario generado">
        <div className="h-72">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoney(v, { compact: true })} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel title="Ventas por Categoría" description="Distribución de revenue">
        <div className="h-72 flex items-center justify-center">
          {loading ? (
            <Skeleton className="h-48 w-48 rounded-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={catData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="revenue"
                  nameKey="category"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {catData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>
    </div>
  );
}
