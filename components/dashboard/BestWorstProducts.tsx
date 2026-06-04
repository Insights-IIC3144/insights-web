import { Panel } from "@/components/ui-extra/Panel";
import { Skeleton } from "@/components/ui/skeleton";
import { TopProductEntry, TopProductsData } from "@/types/sales";
import { fmtMoney, fmtNum } from "@/lib/format";
import { TopLimitSelector } from "@/components/dashboard/TopLimitSelector";

interface Props {
  data: TopProductsData | null;
  loading: boolean;
  limit: number;
  onLimitChange: (n: number) => void;
}

function ProductList({ items, variant }: { items: TopProductEntry[]; variant: "best" | "worst" }) {
  const badge =
    variant === "best" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600";

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay datos disponibles
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((p) => (
        <div
          key={p.productId}
          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors"
        >
          <span
            className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${badge}`}
          >
            {p.rank}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{p.productName}</p>
            <p className="text-xs text-muted-foreground">{p.category}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-foreground">{fmtMoney(p.revenueNet)}</p>
            <p className="text-xs text-muted-foreground">{fmtNum(p.unitsSold)} uds.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-1">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-6 h-6 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BestWorstProducts({ data, loading, limit, onLimitChange }: Props) {
  return (
    <Panel
      title="Mejores y Peores Productos"
      description="Productos con mayor y menor ingreso neto en el período seleccionado."
      action={<TopLimitSelector value={limit} onChange={onLimitChange} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">
            Mejores Productos
          </h4>
          {loading ? (
            <SkeletonList count={limit} />
          ) : (
            <ProductList items={data?.best ?? []} variant="best" />
          )}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3">
            Peores Productos
          </h4>
          {loading ? (
            <SkeletonList count={limit} />
          ) : (
            <ProductList items={data?.worst ?? []} variant="worst" />
          )}
        </div>
      </div>
    </Panel>
  );
}
