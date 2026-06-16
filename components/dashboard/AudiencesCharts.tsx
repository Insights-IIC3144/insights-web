"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui-extra/InfoTooltip";
import { AudiencesGender, AudiencesAge } from "@/types/audiences";
import { fmtNum } from "@/lib/format";

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--popover-foreground))",
};

const GENDER_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

interface Props {
  gender: AudiencesGender[];
  age: AudiencesAge[];
  loading: boolean;
}

export function AudiencesCharts({ gender, age, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg md:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Donut gender */}
      <div className="panel">
        <div className="panel-header flex items-center gap-1.5">
          <div className="font-semibold text-sm">Por género</div>
          <InfoTooltip text="Distribución de compradores únicos por género. Útil para ajustar comunicaciones y mix de catálogo." />
        </div>
        <div className="panel-body flex flex-col items-center gap-4">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={gender}
                dataKey="customerCount"
                nameKey="gender"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {gender.map((entry, index) => (
                  <Cell
                    key={entry.gender}
                    fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => [fmtNum(value), "Clientes"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {gender.map((entry, index) => (
              <div key={entry.gender} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: GENDER_COLORS[index % GENDER_COLORS.length] }}
                />
                <span className="text-muted-foreground">{entry.gender}</span>
                <span className="font-semibold">{entry.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar age */}
      <div className="panel md:col-span-2">
        <div className="panel-header flex items-center gap-1.5">
          <div className="font-semibold text-sm">Por rango de edad</div>
          <InfoTooltip text="Cantidad de compradores únicos por tramo etario. Identifica el segmento dominante y posibles oportunidades en grupos sub-representados." direction="left" />
        </div>
        <div className="panel-body">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={age}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="ageRange"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtNum(v)}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value: number) => [fmtNum(value), "Clientes"]}
              />
              <Bar
                dataKey="customerCount"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
