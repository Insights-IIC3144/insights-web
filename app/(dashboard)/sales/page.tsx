"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER Y FILTROS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Ventas</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de rendimiento y métricas clave de tu negocio.
          </p>
          <div className="mt-4 inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-500 border border-amber-500/20">
            🚧 Próximamente disponible en el siguiente PR
          </div>
        </div>
        
        {/* Skeleton para los filtros (Selectores de Fecha/Tienda) */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* KPI CARDS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiSkeleton title="Ingresos Totales" icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} />
        <KpiSkeleton title="Órdenes" icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} />
        <KpiSkeleton title="Ticket Promedio" icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} />
        <KpiSkeleton title="Clientes Activos" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
      </div>

      {/* CHARTS AREA */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICO PRINCIPAL */}
        <Card className="col-span-4 lg:col-span-5 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Ventas en el Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Skeleton simulando un gráfico de barras/líneas */}
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

        {/* GRÁFICO SECUNDARIO O TOP PRODUCTOS */}
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
              {/* Table Header Skeleton */}
              <div className="flex items-center justify-between p-4 border-b bg-muted/40">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              {/* Table Rows Skeleton */}
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

// Componente helper para las tarjetas de KPI
function KpiSkeleton({ title, icon }: { title: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}
