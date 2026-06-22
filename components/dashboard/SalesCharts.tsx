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
import { projectLinear } from "@/lib/projection";

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


function RevenueOrdersLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-1">
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "hsl(var(--chart-1))", opacity: 0.85 }} />
        Ingresos netos
      </span>
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" className="rounded-sm" style={{ overflow: "hidden" }}>
          <defs>
            <pattern id="legendHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="hsl(var(--chart-1))" strokeWidth="3" strokeOpacity="0.55" />
            </pattern>
          </defs>
          <rect width="12" height="12" fill="url(#legendHatch)" />
        </svg>
        Ingresos proyectados
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-0.5" style={{ background: "hsl(var(--chart-3))" }} />
        Órdenes
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-0.5 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--chart-3))", opacity: 0.5 }} />
        Órdenes proyectadas
      </span>
    </div>
  );
}

export function SalesCharts({ kpis, categorySales, loading, granularity, onGranularityChange, onCategorySelect }: Props) {
  const historical = kpis.map((k) => ({
    label: k.date,
    revenue: k.revenueNet ?? 0,
    orders: k.totalOrders ?? 0,
    aov: k.avgOrderValue ?? 0,
  }));

  const labels = historical.map((d) => d.label);
  const projRevenue = projectLinear(labels, historical.map((d) => d.revenue), granularity);
  const projAov = projectLinear(labels, historical.map((d) => d.aov), granularity);
  const projOrders = projectLinear(labels, historical.map((d) => d.orders), granularity);

  const trendData = [
    ...historical.map((d, i) => ({
      ...d,
      revenueProj: i === historical.length - 1 ? d.revenue : undefined,
      aovProj: i === historical.length - 1 ? d.aov : undefined,
      ordersProj: i === historical.length - 1 ? d.orders : undefined,
    })),
    ...projRevenue.map((p, i) => ({
      label: p.label,
      revenue: undefined,
      orders: undefined,
      aov: undefined,
      revenueProj: p.value,
      aovProj: projAov[i]?.value,
      ordersProj: projOrders[i]?.value,
    })),
  ];

  const catData = categorySales
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <ChartCard
        title="Ventas en el Tiempo"
        subtitle="Evolución de los ingresos netos (USD) según la granularidad seleccionada. Útil para identificar tendencias y estacionalidad."
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
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="url(#revenueGrad)" strokeWidth={2} connectNulls={false} />
              <Area type="monotone" dataKey="revenueProj" stroke="hsl(var(--chart-1))" fill="none" strokeWidth={2} strokeDasharray="6 3" strokeOpacity={0.5} connectNulls={false} name="Proyección" />
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
              <Line type="monotone" dataKey="aov" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="aovProj" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="6 3" strokeOpacity={0.5} dot={false} connectNulls={false} name="Proyección" />
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
          subtitle="Compara el volumen de órdenes con los ingresos netos (USD). Útil para detectar si el aumento de órdenes se traduce en mayores ingresos o si hay descuentos/promociones afectando el margen."
          actions={<GranularitySelector value={granularity} onChange={onGranularityChange} />}
        >
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <defs>
                  <pattern id="revenueHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="hsl(var(--chart-1))" strokeWidth="3" strokeOpacity="0.55" />
                  </pattern>
                </defs>
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
                <Legend content={<RevenueOrdersLegend />} />
                <Bar yAxisId="revenue" dataKey="revenue" fill="hsl(var(--chart-1))" opacity={0.85} radius={[4, 4, 0, 0]} name="Ingresos netos" />
                <Line yAxisId="orders" type="monotone" dataKey="orders" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} name="Órdenes" connectNulls={false} />
                <Bar yAxisId="revenue" dataKey="revenueProj" fill="url(#revenueHatch)" radius={[4, 4, 0, 0]} name="Ingresos proyectados" />
                <Line yAxisId="orders" type="monotone" dataKey="ordersProj" stroke="hsl(var(--chart-3))" strokeWidth={2} strokeDasharray="6 3" strokeOpacity={0.5} dot={false} name="Órdenes proyectadas" connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}