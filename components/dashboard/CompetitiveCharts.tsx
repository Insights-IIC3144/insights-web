import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Panel } from "@/components/ui-extra/Panel";
import { ChartCard } from "@/components/ui-extra/ChartCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmtMoney, fmtPct } from "@/lib/format";
import { getOpportunity } from "@/lib/opportunity";
import { CompetitiveInsightDto } from "@/types/competitive";

interface CategoryDetail {
  category: string;
  brandSales: number;
  categorySales: number;
  salesSharePct: number;
  priceGapPct: number;
  averageBrandPrice: number;
  averageBenchmarkPrice: number;
}

interface Props {
  salesShareByCategory: { category: string; sharePct: number }[];
  detailByCategory: CategoryDetail[];
  topCategories: CategoryDetail[];
  loading: boolean;
  onCategorySelect?: (category: string) => void;
  insights?: CompetitiveInsightDto[];
  loadingInsights?: boolean;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

export function CompetitiveCharts({
  salesShareByCategory,
  detailByCategory,
  topCategories,
  loading,
  onCategorySelect,
  insights = [],
  loadingInsights = false
}: Props) {

  const getInsightForCategory = (category: string) => {
    return insights.find(i => i.category === category);
  };

  return (
    <>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Panel
          className="lg:col-span-2"
          title="Share de ventas por categoría"
          description="% de los ingresos de la categoría capturados por tu marca"
        >
          <div className="h-72">
            {loading ? (
              <Skeleton className="h-full w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesShareByCategory} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" interval={0} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}%`} />
                  <Bar dataKey="sharePct" name="Share" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} onClick={(entry) => onCategorySelect?.(entry.payload?.category)} style={{ cursor: 'pointer' }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <ChartCard title="Precio promedio por categoría" subtitle="Marca vs benchmark agregado">
          {loading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={detailByCategory} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtMoney(v)} cursor={{ fill: "hsl(var(--muted))" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Bar dataKey="averageBrandPrice" name="Marca" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={14} onClick={(entry) => onCategorySelect?.(entry.payload?.category)} style={{ cursor: 'pointer' }} />
                <Bar dataKey="averageBenchmarkPrice" name="Benchmark" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} maxBarSize={14} onClick={(entry) => onCategorySelect?.(entry.payload?.category)} style={{ cursor: 'pointer' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Top categories insight cards */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          {loadingInsights && (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
              <h3 className="text-lg font-semibold text-indigo-600">Generando Insights...</h3>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-center items-stretch gap-5">
          {loading
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-full md:w-[calc(33.333%-1rem)] h-28 rounded-xl flex-shrink-0" />)
            : topCategories.map((c) => {
              const insight = getInsightForCategory(c.category);
              return (
                <div key={c.category} className="w-full md:w-[calc(50%-0.67rem)] lg:w-[calc(33.333%-0.84rem)] flex flex-col">
                  <div className="panel p-5 min-h-[140px] flex flex-col justify-center h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-full">
                        <div className="text-xs text-muted-foreground font-medium">{c.category}</div>
                        {!loadingInsights && (
                          <div className="font-semibold text-sm mt-0.5">
                            {insight?.opportunityTitle || getOpportunity(c)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {insight?.opportunityTitle ? (
                          <Sparkles className="h-4 w-4 text-indigo-400 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
                        )}
                      </div>
                    </div>

                    {loadingInsights ? (
                      <div className="flex justify-center my-4">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {insight?.opportunityDescription || (
                          <>
                            Tu share es <span className="font-semibold text-primary">{fmtPct(c.salesSharePct)}</span>.
                            Precio promedio marca <span className="text-primary">{fmtMoney(c.averageBrandPrice)}</span> vs benchmark <span className="text-primary">{fmtMoney(c.averageBenchmarkPrice)}</span>.
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Detail table */}
      <div className="panel mb-5">
        <div className="p-5 border-b">
          <h3 className="font-semibold text-sm">Detalle por categoría</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Share, pricing y oportunidades</p>
        </div>
        {loading ? (
          <div className="p-5 space-y-2">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
          </div>
        ) : (
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
                {detailByCategory.map((c) => {
                  const insight = getInsightForCategory(c.category);
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
                      <TableCell className="text-xs py-4 px-6">
                        {loadingInsights ? (
                          <div className="flex items-center gap-2 text-indigo-500">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Analizando...</span>
                          </div>
                        ) : (
                          insight?.opportunityTitle || getOpportunity(c)
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}