"use client";

import { PageHeader } from "@/components/ui-extra/PageHeader";
import { Filters } from "@/components/ui-extra/Filters";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { ChartCard } from "@/components/ui-extra/ChartCard";
import { competitionByCategory, competitionTrend, competitivePosition, fmtCurrency } from "@/lib/mock";
import { fmtMoney, fmtPct } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Target, DollarSign, Activity, Lightbulb } from "lucide-react";
import { Panel } from "@/components/ui-extra/Panel";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export default function CompetitivePositioningPage() {
  const totalBrand = competitionByCategory.reduce((sum, c) => sum + c.brandSales, 0);
  const totalCategory = competitionByCategory.reduce((sum, c) => sum + c.categorySales, 0);
  const overallShare = (totalBrand / totalCategory) * 100;
  const avgPriceBrand =
    competitionByCategory.reduce((sum, c) => sum + c.brandAvgPrice, 0) /
    competitionByCategory.length;
  const avgPriceBench =
    competitionByCategory.reduce((sum, c) => sum + c.benchAvgPrice, 0) /
    competitionByCategory.length;

  return (
    <div>
      <PageHeader
        title="Posicionamiento Competitivo"
        subtitle="Tu marca comparada contra el benchmark agregado de otras marcas en TheLook. Sin nombres individuales."
      />
      <div className="mb-6 inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 border border-amber-500/20">
        🚧 Próximamente disponible en el siguiente PR
      </div>
      <Filters />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Share de ventas"
          value={fmtPct(overallShare)}
          delta={2.1}
          icon={<Target className="h-4 w-4" />}
          hint="vs benchmark"
        />
        <KpiCard label="Unidades share" value="14.8%" delta={1.4} icon={<Activity className="h-4 w-4" />} />
        <KpiCard
          label="Precio promedio marca"
          value={fmtMoney(avgPriceBrand)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Δ vs precio benchmark"
          value={fmtPct(((avgPriceBrand - avgPriceBench) / avgPriceBench) * 100)}
          delta={3.2}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Panel className="lg:col-span-2" title="Share de ventas por categoría" description="% del revenue de la categoría capturado por tu marca">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitivePosition} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
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
            <BarChart data={competitionByCategory} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} cursor={{ fill: "hsl(var(--muted))" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Bar dataKey="brandAvgPrice" name="Marca" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={14} />
              <Bar dataKey="benchAvgPrice" name="Benchmark" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} maxBarSize={14} />
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
              <TableRow className="hover:bg-transparent">
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Ventas marca</TableHead>
                <TableHead className="text-right">Ventas categoría</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead className="text-right">Precio marca</TableHead>
                <TableHead className="text-right">Precio benchmark</TableHead>
                <TableHead>Oportunidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitionByCategory.map((c) => (
                <TableRow key={c.category}>
                  <TableCell className="font-medium">{c.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtMoney(c.brandSales)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{fmtMoney(c.categorySales)}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-primary">{c.share}%</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmtMoney(c.brandAvgPrice)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{fmtMoney(c.benchAvgPrice)}</TableCell>
                  <TableCell className="text-xs">{c.opportunity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {competitionByCategory.slice(0, 3).map((c) => (
          <div key={c.category} className="panel p-5">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground font-medium">{c.category}</div>
                <div className="font-semibold text-sm mt-0.5">{c.opportunity}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu share es <span className="font-semibold text-foreground">{c.share}%</span>. Precio promedio marca {fmtMoney(c.brandAvgPrice)} vs benchmark {fmtMoney(c.benchAvgPrice)}.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
