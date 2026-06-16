"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui-extra/InfoTooltip";
import { AudiencesFunnel } from "@/types/audiences";
import { fmtNum } from "@/lib/format";

interface Props {
  data: AudiencesFunnel[];
  loading: boolean;
}

export function FunnelTable({ data, loading }: Props) {
  const totalVisitas = data.reduce((s, r) => s + (r.visitas ?? 0), 0);
  const totalPurchases = data.reduce((s, r) => s + (r.purchases ?? 0), 0);
  const totalConv = totalVisitas > 0 ? (totalPurchases / totalVisitas) * 100 : 0;

  return (
    <div className="panel">
      <div className="panel-header flex items-center gap-1.5">
        <div>
          <div className="font-semibold text-sm">Funnel de tráfico</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Visitas → vistas de producto → carrito → compra
          </div>
        </div>
        <InfoTooltip
          text="Muestra cuántas sesiones de cada fuente avanzan en cada etapa. CONV. = compras / visitas totales de esa fuente."
          direction="left"
        />
      </div>

      <div className="panel-body">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Traffic Source</th>
                  <th className="text-right">Visitas</th>
                  <th className="text-right">Product Views</th>
                  <th className="text-right">Add to Cart</th>
                  <th className="text-right">Purchases</th>
                  <th className="text-right">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted-foreground">
                      No hay datos disponibles
                    </td>
                  </tr>
                ) : (
                  <>
                    {data.map((row) => (
                      <tr key={row.trafficSource}>
                        <td className="font-medium text-foreground">{row.trafficSource}</td>
                        <td className="text-right">{fmtNum(row.visitas)}</td>
                        <td className="text-right">{fmtNum(row.productViews)}</td>
                        <td className="text-right">{fmtNum(row.addToCart)}</td>
                        <td className="text-right">{fmtNum(row.purchases)}</td>
                        <td className="text-right">
                          <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular">
                            {row.conversionRate?.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border font-semibold text-foreground">
                      <td>Total</td>
                      <td className="text-right">{fmtNum(totalVisitas)}</td>
                      <td className="text-right text-muted-foreground">—</td>
                      <td className="text-right text-muted-foreground">—</td>
                      <td className="text-right">{fmtNum(totalPurchases)}</td>
                      <td className="text-right">
                        <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular">
                          {totalConv.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
