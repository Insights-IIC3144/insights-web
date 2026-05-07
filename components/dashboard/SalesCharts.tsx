import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, LineChart, Line, ComposedChart, Bar,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { SalesKpi, SalesByCategory } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";
import { ChartCard } from "../ui-extra/ChartCard";

interface Props {
  kpis: SalesKpi[];
  categorySales: SalesByCategory[];
  loading: boolean;
}

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];
/*
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
  */

export function SalesCharts({ kpis, categorySales, loading }: Props) {
  const trendData = kpis.map((k) => ({
    label: k.date,
    revenue: k.revenueNet ?? 0,
    orders: k.totalOrders ?? 0,
    aov: k.avgOrderValue ?? 0,
  }));

  const catData = categorySales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="Ventas en el Tiempo"
      subtitle="Evolución de los ingresos netos según la granularidad seleccionada. 
      Útil para identificar tendencias y estacionalidad."
      >
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
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmtMoney(v), "Ingresos netos"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="url(#revenueGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Ticket Promedio en el Tiempo"
      subtitle="Valor promedio por orden completada. 
      Un aumento sostenido indica que los clientes están comprando productos de mayor valor.">
        {loading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => fmtMoney(v)} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmtMoney(v), "Ticket promedio"]} />
              <Line type="monotone" dataKey="aov" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Ventas por Categoría"
        subtitle="Distribución de ingresos por categoría de producto.
        Útil para identificar las categorías más rentables y detectar cambios en el comportamiento de compra.">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {catData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmtMoney(v), "Ingresos"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Órdenes vs Ingresos Netos"
        subtitle="Compara el volumen de órdenes con los ingresos netos. 
        Útil para detectar si el aumento de órdenes se traduce en mayores ingresos o si hay descuentos/promociones afectando el margen.">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="revenue" orientation="left" tickFormatter={(v) => fmtMoney(v)} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="orders" orientation="right" tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v: number, name: string) =>
                    name === "revenue" ? [fmtMoney(v), "Ingresos netos"] : [fmtNum(v), "Órdenes"]
                  }
                />
                <Legend />
                <Bar yAxisId="revenue" dataKey="revenue" fill="hsl(var(--chart-1))" opacity={0.8} radius={[4, 4, 0, 0]} name="revenue" />
                <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="orders" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}