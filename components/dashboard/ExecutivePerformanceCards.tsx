import { Panel } from "../ui-extra/Panel"
import { usePerformanceCardsData } from "@/hooks/usePerformanceCardsData"
import { fmtNum } from "@/lib/format"

interface Props {
  activeFilters: Record<string, string>
}

export function ExecutivePerformanceCards({ activeFilters }: Props) {
  const { audiencias, retencion, competitiveCards, loading } = usePerformanceCardsData(activeFilters)

  const dash = (v: string | number | null | undefined) =>
    v == null ? "—" : v

  const contentClass = loading ? "space-y-3 opacity-50" : "space-y-3"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Panel
        title="Audiencias"
        description="Compradores activos del período"
      >
        <div className={contentClass}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Canal principal</span>
            <span className="text-sm font-medium">{dash(audiencias?.mainChannel)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Mayor ciudad</span>
            <span className="text-sm font-medium">{dash(audiencias?.mainCity)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Edad principal</span>
            <span className="text-sm font-medium">
              {audiencias?.mainAgeRange != null
                ? `${audiencias.mainAgeRange} (${audiencias.ageRangePercentage?.toFixed(1)}%)`
                : "—"}
            </span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Retención de clientes"
        description="Fidelización en el período"
      >
        <div className={contentClass}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Compradores recurrentes</span>
            <span className="text-lg font-semibold tabular">
              {retencion?.recurringBuyers != null ? fmtNum(retencion.recurringBuyers) : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Artículos por cliente</span>
            <span className="text-sm font-medium">
              {retencion?.avgProductsPerClient != null
                ? retencion.avgProductsPerClient.toFixed(2)
                : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Canal con mayor retención</span>
            <span className="text-sm font-medium">{dash(retencion?.topRetentionChannel)}</span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Posicionamiento competitivo"
        description="Share vs benchmark de categoría"
      >
        <div className={contentClass}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Mayor share</span>
            <span className="text-sm font-medium">
              {competitiveCards?.topShareCategory != null
                ? `${competitiveCards.topShareCategory} · ${competitiveCards.topSharePercentage?.toFixed(1)}%`
                : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Mejor crecimiento</span>
            <span className="text-sm font-medium text-success">
              {competitiveCards?.bestGrowthCategory != null
                ? `${competitiveCards.bestGrowthCategory} (${competitiveCards.bestGrowthPercentage ? (competitiveCards.bestGrowthPercentage > 0 ? "+" : "") + competitiveCards.bestGrowthPercentage.toFixed(1) : "0.0"}%)`
                : "—"}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">A revisar</span>
            <span className="text-sm font-medium text-warning">
              {competitiveCards?.worstGrowthCategory != null
                ? `${competitiveCards.worstGrowthCategory} (${competitiveCards.worstGrowthPercentage?.toFixed(1)}%)`
                : "—"}
            </span>
          </div>
        </div>
      </Panel>
    </div>
  )
}
