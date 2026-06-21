import { Panel } from "@/components/ui-extra/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesPerformanceByDimension } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";

interface Props {
  performance: SalesPerformanceByDimension[];
  loading: boolean;
}

export function PerformanceTable({ performance, loading }: Props) {
  return (
    <Panel title="Rendimiento por Fuente de Tráfico" description="Desglose de métricas operativas por fuente.">
      <div className="panel-body">
        {loading ? (
          <div className="space-y-4">
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
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Fuente de Tráfico</th>
                  <th className="text-right">Órdenes</th>
                  <th className="text-right">Unidades</th>
                  <th className="text-right">Ticket Promedio (USD)</th>
                  <th className="text-right">Ingresos (USD)</th>
                </tr>
              </thead>
              <tbody>
                {performance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-muted-foreground">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  performance.map((p, i) => (
                    <tr key={i}>
                      <td className="font-medium text-foreground">{p.dimensionName}</td>
                      <td className="text-right font-medium">{fmtNum(p.orders)}</td>
                      <td className="text-right">{fmtNum(p.unitsSold)}</td>
                      <td className="text-right">
                        {fmtMoney(p.orders > 0 ? p.revenue / p.orders : 0)}
                      </td>
                      <td className="text-right font-medium text-primary">{fmtMoney(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Panel>
  );
}
