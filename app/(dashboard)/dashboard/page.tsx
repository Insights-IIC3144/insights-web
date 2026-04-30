"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/ui-extra/KpiCard";
import { Panel } from "@/components/ui-extra/Panel";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { DollarSign, ShoppingBag, Package, Users, ReceiptText } from "lucide-react";
import { api } from "@/lib/api";

const fmtCurrency = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtNumber = (v: number) => v.toLocaleString('en-US');

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-elevated)",
};

interface ExecutiveKpi {
  date: string;
  brand: string;
  revenue: number;
  totalOrders: number;
  unitsSold: number;
  uniqueCustomers: number;
}

interface CategorySales {
  date: string;
  brand: string;
  category: string;
  revenue: number;
}

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<ExecutiveKpi[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiRes, catRes] = await Promise.all([
          api.get<ExecutiveKpi[]>('/insights/executive-kpis'),
          api.get<CategorySales[]>('/insights/category-sales')
        ]);
        
        if (kpiRes) setKpis(kpiRes);
        if (catRes) setCategorySales(catRes);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = kpis.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders = kpis.reduce((s, d) => s + (d.totalOrders || 0), 0);
  const totalUnits = kpis.reduce((s, d) => s + (d.unitsSold || 0), 0);
  const uniqueCustomers = kpis.reduce((s, d) => s + (d.uniqueCustomers || 0), 0); // Note: Simple sum of daily unique customers is an approximation.
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Process data for charts
  const trendData = kpis.map(k => ({
    label: k.date,
    revenue: k.revenue
  })).sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

  const catDataMap = categorySales.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.revenue;
    return acc;
  }, {} as Record<string, number>);
  
  const catData = Object.entries(catDataMap)
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Top 5 categories

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visión ejecutiva del desempeño de tu marca dentro de TheLook eCommerce."
      />
      <Filters showGender showTraffic />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Ventas totales" value={fmtCurrency(totalRevenue)} delta={0} hint="vs período anterior" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Órdenes" value={fmtNumber(totalOrders)} delta={0} hint="30d" icon={<ShoppingBag className="h-4 w-4" />} />
        <KpiCard label="Unidades vendidas" value={fmtNumber(totalUnits)} delta={0} hint="30d" icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Clientes únicos" value={fmtNumber(uniqueCustomers)} delta={0} hint="30d" icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Ticket promedio" value={fmtCurrency(aov)} delta={0} hint="vs período anterior" icon={<ReceiptText className="h-4 w-4" />} />
      </div>

      {/* Trend + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2" title="Tendencia de ventas" description="Revenue diario">
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtCurrency(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel title="Revenue por categoría" description="Top categorías">
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtCurrency(v)} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
