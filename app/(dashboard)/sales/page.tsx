"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filters } from "@/components/ui-extra/Filters";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { SalesKpiGrid } from "@/components/dashboard/SalesKpiGrid";
import { useSalesData } from "@/hooks/useSalesData";

export default function SalesDashboard() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const { kpis, loading } = useSalesData(activeFilters);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* HEADER Y FILTROS */}
      <PageHeader
        title="Dashboard de Ventas"
        subtitle="Resumen de rendimiento y métricas clave de tu negocio."
      />
      <Filters onChange={setActiveFilters} />

      {/* KPI CARDS */}
      <SalesKpiGrid data={kpis} loading={loading} />

      {/* CHARTS AREA */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        <Card className="col-span-4 lg:col-span-5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Ventas en el Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2 pb-2">
              {[...Array(12)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-full rounded-t-sm"
                  style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:col-span-2 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-[180px]">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DATA TABLE AREA */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Últimas Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-[250px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
            <div className="border rounded-md">
              <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
                  <Skeleton className="h-4 w-20" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}