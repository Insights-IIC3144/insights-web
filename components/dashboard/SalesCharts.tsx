import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, LineChart, Line, ComposedChart, Bar,
  BarChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { SalesKpi, SalesByCategory } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";
import { ChartCard } from "../ui-extra/ChartCard";
import { GranularitySelector } from "@/components/dashboard/GranularitySelector";

interface Props {
  kpis: SalesKpi[];
  categorySales: SalesByCategory[];
  loading: boolean;
  granularity: string;
  onGranularityChange: (g: string) => void;
  onCategorySelect?: (category: string) => void;
}

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};


export function SalesCharts({ kpis, categorySales, loading, granularity, onGranularityChange, onCategorySelect }: Props) {
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
      <ChartCard
        title="Ventas en el Tiempo"
        subtitle="Evolución de los ingresos netos según la granularidad seleccionada. Útil para identificar tendencias y estacionalidad."
        actions={<GranularitySelector value={granularity} onChange={onGranularityChange} />}
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

      <ChartCard
        title="Ticket Promedio en el Tiempo"
        subtitle="Valor promedio por orden completada. Un aumento sostenido indica que los clientes están comprando productos de mayor valor."
        actions={<GranularitySelector value={granularity} onChange={onGranularityChange} />}
      >
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
              <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmtMoney(v, { compact: true })} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [fmtMoney(v), "Ingresos"]} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={14} onClick={(entry) => onCategorySelect?.(entry.payload?.category)} style={{ cursor: 'pointer' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Ingresos Netos vs Órdenes"
          subtitle="Compara el volumen de órdenes con los ingresos netos. Útil para detectar si el aumento de órdenes se traduce en mayores ingresos o si hay descuentos/promociones afectando el margen."
          actions={<GranularitySelector value={granularity} onChange={onGranularityChange} />}
        >
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
                <Bar yAxisId="revenue" dataKey="revenue" fill="hsl(var(--chart-1))" opacity={0.8} radius={[4, 4, 0, 0]} name="Ingresos netos" />
                <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Órdenes" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}