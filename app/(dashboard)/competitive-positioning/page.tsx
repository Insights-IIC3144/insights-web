"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { Filters } from "@/components/ui-extra/Filters";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { ChartCard } from "@/components/ui-extra/ChartCard";
import { fmtMoney, fmtPct } from "@/lib/format";
//import { useUserContext } from "@/context/UserContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Target, DollarSign, Activity, Lightbulb } from "lucide-react";
import { Panel } from "@/components/ui-extra/Panel";
import { useCompetitiveStats } from "@/hooks/useCompetitiveData";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function CompetitivePositioningPage() {
  // const { selectedBrand: brand, days } = useUserContext();
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { loading, stats } = useCompetitiveStats(activeFilters);

  return (
    <div>
      <PageHeader
        title="Posicionamiento Competitivo"
        subtitle="Tu marca comparada contra el benchmark agregado de otras marcas en TheLook. Sin nombres individuales."
      />

      {/* TODO: filters must only be displayed when they are functional
      <Filters onChange={setActiveFilters} />
      */}

      {loading && <div className="mb-4 text-xs text-muted-foreground">Cargando datos...</div>}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KpiCard
              label="Share de ventas"
              value={fmtPct(stats.kpis.overallSalesShare)}
              icon={<Target className="h-4 w-4" />}
            />
            <KpiCard
              label="Unidades share"
              value={fmtPct(stats.kpis.overallVolumeShare)}
              icon={<Activity className="h-4 w-4" />}
            />
            <KpiCard
              label="Precio promedio marca"
              value={fmtMoney(stats.kpis.avgPriceBrand)}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <KpiCard
              label="Δ vs precio benchmark"
              value={fmtPct(stats.kpis.priceGapPct)}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <Panel className="lg:col-span-2" title="Share de ventas por categoría" description="% del revenue de la categoría capturado por tu marca">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesShareByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" interval={0} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}%`} />
                    <Bar dataKey="sharePct" name="Share" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <ChartCard title="Precio promedio por categoría" subtitle="Marca vs benchmark agregado">
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={stats.detailByCategory} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={70} />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  <Bar dataKey="averageBrandPrice" name="Marca" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={14} />
                  <Bar dataKey="averageBenchmarkPrice" name="Benchmark" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="panel mb-5">
            <div className="p-5 border-b">
              <h3 className="font-semibold text-sm">Detalle por categoría</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Share, pricing y oportunidades</p>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="text-muted-foreground font-medium py-3 px-6">Categoría</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium py-3 px-6">Ventas marca</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium py-3 px-6">Ventas categoría</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium py-3 px-6">Share</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium py-3 px-6">Precio marca</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium py-3 px-6">Precio benchmark</TableHead>
                    <TableHead className="text-muted-foreground font-medium py-3 px-6">Oportunidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.detailByCategory.map((c) => {
                    const oportunidad = (() => {
                      if (c.salesSharePct < 15) return "Baja participación, evaluar surtido";
                      if (c.priceGapPct > 5) return "Precio sobre benchmark";
                      if (c.priceGapPct < -5) return "Precio bajo benchmark, margen";
                      return "Posición competitiva";
                    })();
                    return (
                      <TableRow key={c.category} className="border-b last:border-0">
                        <TableCell className="font-medium py-4 px-6">{c.category}</TableCell>
                        <TableCell className="text-right tabular-nums py-4 px-6">{fmtMoney(c.brandSales)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground py-4 px-6">{fmtMoney(c.categorySales)}</TableCell>
                        <TableCell className="text-right py-4 px-6">
                          <span className="font-semibold text-primary">{fmtPct(c.salesSharePct)}</span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums py-4 px-6">{fmtMoney(c.averageBrandPrice)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground py-4 px-6">{fmtMoney(c.averageBenchmarkPrice)}</TableCell>
                        <TableCell className="text-xs py-4 px-6">{oportunidad}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {stats.topCategories.map((c) => {
              const oportunidad = (() => {
                if (c.salesSharePct < 15) return "Baja participación, evaluar surtido";
                if (c.priceGapPct > 5) return "Precio sobre benchmark";
                if (c.priceGapPct < -5) return "Precio bajo benchmark, margen";
                return "Posición competitiva";
              })();
              return (
                <div key={c.category} className="panel p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <div className="text-xs text-muted-foreground font-medium">{c.category}</div>
                      <div className="font-semibold text-sm mt-0.5">{oportunidad}</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tu share es{" "}
                    <span className="font-semibold text-primary">{fmtPct(c.salesSharePct)}</span>.{" "}
                    Precio promedio marca{" "}
                    <span className="text-primary">{fmtMoney(c.averageBrandPrice)}</span>{" "}
                    vs benchmark{" "}
                    <span className="text-primary">{fmtMoney(c.averageBenchmarkPrice)}</span>.
                  </p>
                </div>
              );
            })}
          </div>

        </>
      )}

      {!loading && !stats && (
        <div className="panel flex items-center justify-center h-64">
          <p className="text-muted-foreground text-sm">
            Selecciona una marca en el menú superior para ver el posicionamiento competitivo.
          </p>
        </div>
      )}
    </div>
  );
}
