import { Panel } from "@/components/ui-extra/Panel";
import { AiInsightDto } from "@/types/catalog";
import { Lightbulb, PieChart, PlusCircle, Shuffle, Sparkles, Tag, TrendingUp, AlertTriangle, PackageX, ChevronDown, RotateCcw, Info, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/context/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AiActionCardsProps {
  insights: AiInsightDto[];
  loading: boolean;
  onRefresh?: () => void;
  onAction?: (insight: AiInsightDto) => void;
  actionLabel?: string;
}

export function AiActionCards({ insights, loading, onRefresh, onAction, actionLabel }: AiActionCardsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          <h3 className="text-lg font-semibold text-black">Generando Insights...</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Panel key={i} className="flex flex-col items-center justify-center h-[200px] bg-panel-hover/30 border-transparent">
              <Loader2 className="h-8 w-8 text-indigo-400/50 animate-spin" />
            </Panel>
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-black tracking-tight">Insights Generados por IA</h3>
        </div>
        <Panel className="py-2 px-6 text-center border-dashed border-2 flex flex-col items-center justify-center bg-panel-hover/50">
          <Sparkles className="h-6 w-6 text-indigo-300/50 mb-2 mx-auto flex-shrink-0" />
          <h3 className="text-base font-medium text-black mb-1">No se obtuvieron insights</h3>
          <p className="text-sm text-panel-muted max-w-lg mb-3 leading-relaxed">
            Es posible que el modelo de IA necesite unos segundos para inicializarse (cold start) o que no haya anomalías detectadas con los filtros actuales.
          </p>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar / Refrescar
            </button>
          )}
        </Panel>
      </div>
    );
  }

  const sortedInsights = [...insights]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Sparkles className="h-4 w-4 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-black tracking-tight">Insights Generados por IA</h3>
      </div>

      <div className="flex flex-wrap justify-center items-stretch gap-4">
        {sortedInsights.map((insight) => (
          <div
            key={insight.id}
            className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] flex flex-col"
          >
            <ActionCard insight={insight} onAction={onAction} actionLabel={actionLabel} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCard({
  insight,
  onAction,
  actionLabel,
}: {
  insight: AiInsightDto;
  onAction?: (insight: AiInsightDto) => void;
  actionLabel?: string;
}) {
  const { setSelectedBrand, availableBrands, selectedBrand } = useUserContext();

  const isWarning = insight.type === "warning";
  const isOpportunity = insight.type === "opportunity";
  const isPrice = insight.type === "price";
  const isMarketShare = insight.type === "market_share";
  const isCannibalization = insight.type === "cannibalization";
  const isDeadStock = insight.type === "dead_stock";
  const isCrossSell = insight.type === "cross_sell";
  const isReturns = insight.type === "returns" || insight.type === "return_rate";

  // Agrupamos colores por semántica para simplificar
  const colorRed = isWarning || isDeadStock || isReturns;
  const colorGreen = isOpportunity || isCrossSell;
  const colorBlue = isPrice || isMarketShare;
  const colorOrange = isCannibalization;
  const isFallback = !isWarning && !isDeadStock && !isReturns && !isOpportunity && !isCrossSell && !isPrice && !isMarketShare && !isCannibalization;
  const colorGray = isFallback;

  const toTitleCase = (str: string) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Extract all unique brands from affected products
  const uniqueBrands = new Set<string>();
  
  // Sort available brands by length descending to avoid matching short substrings like "H"
  const sortedBrands = [...availableBrands].sort((a, b) => b.length - a.length);

  if (insight.affectedItems && insight.affectedItems.length > 0) {
    insight.affectedItems.forEach(item => {
      const productName = item.name;
      if (!productName) return;
      const matchedBrand = sortedBrands.find(b =>
        productName.toLowerCase().includes(b.toLowerCase())
      );
      
      if (matchedBrand) {
        uniqueBrands.add(toTitleCase(matchedBrand));
      } else {
        // Fallback: Use the first word if no match is found, though with Title Case
        uniqueBrands.add(toTitleCase(productName.split(' ')[0]));
      }
    });
  }
  
  const brandsToFilter = Array.from(uniqueBrands);

  return (
    <Panel 
      className={cn(
        "relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 flex flex-col h-full",
        colorRed && "hover:border-rose-500/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]",
        colorGreen && "hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        colorBlue && "hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        colorOrange && "hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]"
      )}
      bodyClassName="flex flex-col h-full flex-grow p-0"
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
        colorRed && "bg-gradient-to-br from-rose-500 to-transparent",
        colorGreen && "bg-gradient-to-br from-emerald-500 to-transparent",
        colorBlue && "bg-gradient-to-br from-blue-500 to-transparent",
        colorOrange && "bg-gradient-to-br from-orange-500 to-transparent"
      )} />

      <div className="p-5 flex flex-col flex-grow relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "p-2 rounded-lg",
            colorRed && "bg-rose-500/10 text-rose-400",
            colorGreen && "bg-emerald-500/10 text-emerald-400",
            colorBlue && "bg-blue-500/10 text-blue-400",
            colorOrange && "bg-orange-500/10 text-orange-400",
            colorGray && "bg-slate-500/10 text-slate-400"
          )}>
            {isWarning && <AlertTriangle className="h-5 w-5" />}
            {isDeadStock && <PackageX className="h-5 w-5" />}
            {isOpportunity && <TrendingUp className="h-5 w-5" />}
            {isCrossSell && <PlusCircle className="h-5 w-5" />}
            {isPrice && <Tag className="h-5 w-5" />}
            {isMarketShare && <PieChart className="h-5 w-5" />}
            {isCannibalization && <Shuffle className="h-5 w-5" />}
            {isReturns && <RotateCcw className="h-5 w-5" />}
            {isFallback && <Info className="h-5 w-5" />}
          </div>
          <div className="text-xs font-medium text-panel-muted bg-panel-hover px-2 py-1 rounded-md border border-panel-border/50">
            Impacto: {insight.impactScore}/10
          </div>
        </div>

        <h4 className="text-base font-medium text-black mb-1.5">{insight.title}</h4>

        <p className="text-sm text-panel-foreground leading-relaxed mb-4">
          {insight.description}
        </p>

        <div className="mt-auto flex flex-col gap-2">
          {onAction ? (
            <button
              onClick={() => onAction(insight)}
              className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
            >
              {actionLabel ?? "Ver en dashboard"}
            </button>
          ) : (!selectedBrand || selectedBrand.trim() === "") && brandsToFilter.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative w-full inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm">
                  <span>Revisar...</span>
                  <ChevronDown className="h-4 w-4 opacity-50 absolute right-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="center">
                {brandsToFilter.map(brand => (
                  <DropdownMenuItem
                    key={brand}
                    onClick={() => {
                      setSelectedBrand(brand);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="cursor-pointer font-medium text-sm"
                  >
                    {brand}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (!selectedBrand || selectedBrand.trim() === "") && brandsToFilter.length === 1 ? (
            <button
              onClick={() => {
                setSelectedBrand(brandsToFilter[0]);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm"
            >
              Revisar {brandsToFilter[0]}
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
