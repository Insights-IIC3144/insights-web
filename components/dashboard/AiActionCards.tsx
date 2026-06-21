import React, { useState } from "react";
import { Panel } from "@/components/ui-extra/Panel";
import { AiInsightDto } from "@/types/insights";
import { PieChart, PlusCircle, Shuffle, Sparkles, Tag, TrendingUp, AlertTriangle, PackageX, ChevronDown, RotateCcw, Info, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/context/UserContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AiActionCardsProps {
  insights: AiInsightDto[];
  loading: boolean;
  mode: "audiences" | "catalog";
  onRefresh?: () => void;
  onRegenerate?: (id: string, excludeType?: string) => Promise<void>;
  onAction?: (insight: AiInsightDto) => void;
  actionLabel?: string;
}

export function AiActionCards({ insights, loading, mode, onRefresh, onRegenerate, onAction, actionLabel }: AiActionCardsProps) {
  const { pinnedInsights, setPinnedInsight } = useUserContext();
  const pinnedInsight = pinnedInsights[mode];

  let list = insights || [];
  if (pinnedInsight) {
    const exists = list.some(i => i.id === pinnedInsight.id);
    if (!exists) {
      list = [pinnedInsight, ...list];
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          <h3 className="text-lg font-semibold text-foreground">Generando Insights...</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Panel key={i} className="flex flex-col items-center justify-center h-[200px] bg-muted/30 border-transparent">
              <Loader2 className="h-8 w-8 text-indigo-400/50 animate-spin" />
            </Panel>
          ))}
        </div>
      </div>
    );
  }

  if (!list || list.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Insights Generados por IA</h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Regenerar insights"
              className="ml-auto p-1.5 rounded-md text-panel-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
        <Panel className="py-2 px-6 text-center border-dashed border-2 flex flex-col items-center justify-center bg-muted/50">
          <Sparkles className="h-6 w-6 text-indigo-300/50 mb-2 mx-auto shrink-0" />
          <h3 className="text-base font-medium text-foreground mb-1">No se obtuvieron insights</h3>
          <p className="text-sm text-muted-foreground max-w-lg mb-3 leading-relaxed">
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

  // Sort by impact score descending, then by title alphabetically
  let sortedInsights = [...list].sort((a, b) => {
    const impactDiff = b.impactScore - a.impactScore;
    if (impactDiff !== 0) return impactDiff;
    return (a.title || "").localeCompare(b.title || "");
  });

  // Limit to 6 for symmetry
  sortedInsights = sortedInsights.slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <Sparkles className="h-4 w-4 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Insights Generados por IA</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Regenerar insights"
            className="ml-auto p-1.5 rounded-md text-panel-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center items-stretch gap-4">
        {sortedInsights.map((insight) => (
          <div
            key={insight.id}
            className="w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)] flex flex-col"
          >
            <ActionCard insight={insight} mode={mode} onRegenerate={onRegenerate} onAction={onAction} actionLabel={actionLabel} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCard({ insight, mode, onRegenerate, onAction, actionLabel }: { insight: AiInsightDto, mode: "audiences" | "catalog", onRegenerate?: (id: string, excludeType?: string) => Promise<void>, onAction?: (insight: AiInsightDto) => void, actionLabel?: string }) {
  const { setSelectedBrand, availableBrands, selectedBrand, setPinnedInsight } = useUserContext();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate(insight.id, insight.type);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error al regenerar el insight");
    } finally {
      setIsRegenerating(false);
    }
  };

  const isWarning = insight.type === "warning";
  const isOpportunity = insight.type === "opportunity";
  const isPrice = insight.type === "price";
  const isMarketShare = insight.type === "market_share";
  const isCannibalization = insight.type === "cannibalization";
  const isDeadStock = insight.type === "dead_stock";
  const isCrossSell = insight.type === "cross_sell";
  const isReturns = insight.type === "returns" || insight.type === "return_rate";

  if (isRegenerating) {
    return (
      <Panel className="flex flex-col items-center justify-center h-full min-h-[200px] bg-muted/30 border-transparent">
        <Loader2 className="h-8 w-8 text-indigo-400/50 animate-spin" />
      </Panel>
    );
  }

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

  const isAudiencesMode = mode === "audiences";
  const isProductScope = insight.scope === "product";
  const hasAffectedItems = !!(insight.affectedItems?.length);
  const showAffectedItemsList = !isAudiencesMode && isProductScope && hasAffectedItems;

  // Brand extraction (relevant to suggest brand filtering)
  const brandsToFilter: [string, string][] = [];
  if (!isAudiencesMode && hasAffectedItems) {
    const uniqueBrandsMap = new Map<string, string>();
    const sortedBrands = [...availableBrands].sort((a, b) => b.length - a.length);

    insight.affectedItems.forEach(item => {
      const itemName = item.name;
      if (!itemName) return;
      const matchedBrand = sortedBrands.find(b =>
        itemName.toLowerCase().includes(b.toLowerCase())
      );
      
      if (matchedBrand) {
        uniqueBrandsMap.set(matchedBrand, toTitleCase(matchedBrand));
      }
    });
    brandsToFilter.push(...uniqueBrandsMap.entries());
  }

  const hasMultipleBrandOptions = brandsToFilter.length > 1;
  const hasSingleBrandOption = brandsToFilter.length === 1;
  const noBrandCurrentlySelected = !selectedBrand || selectedBrand.trim() === "";
  const showSingleBrandButton = noBrandCurrentlySelected && hasSingleBrandOption;

  const handleAction = () => {
    setPinnedInsight(mode, insight);
    onAction?.(insight);
  };

  const handleSelectBrand = (brand: string) => {
    setPinnedInsight(mode, insight);
    setSelectedBrand(brand);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Panel
      className="relative overflow-hidden transition-shadow duration-300 hover:[box-shadow:var(--shadow-elevated)] flex flex-col h-full border border-border"
      bodyClassName="flex flex-col h-full flex-grow p-0"
    >

      <div className="p-5 flex flex-col grow relative z-10">
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
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button 
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50 bg-card hover:bg-muted p-1.5 rounded-md border border-primary/20 shadow-sm"
                title="Generar nuevo insight distinto"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin")} />
              </button>
            )}
            <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border/50">
              Impacto: {insight.impactScore}/10
            </div>
          </div>
        </div>

        <h4 className="text-base font-medium text-foreground mb-1.5">{insight.title}</h4>

        {showAffectedItemsList && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-primary">
                Afecta a {insight.affectedItems.length} producto(s):
              </p>
              <Popover>
                <PopoverTrigger className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors outline-none cursor-pointer">
                  Ver productos
                  <ChevronDown className="h-3 w-3 ml-0.5" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-3 bg-white shadow-lg border border-slate-200">
                  <p className="text-xs font-semibold mb-2 text-slate-800">Productos afectados</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 max-h-48 overflow-y-auto pr-1">
                    {insight.affectedItems.map(item => (
                      <li key={item.id} className="truncate" title={item.name || String(item.id)}>
                        {item.name || String(item.id)}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <p className="text-sm text-foreground leading-relaxed mb-4">
          {insight.description}
        </p>

        <div className="mt-auto">
          {isAudiencesMode ? (
            <button
              onClick={handleAction}
              className="w-full inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              {actionLabel || "Revisar"}
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {hasMultipleBrandOptions ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative w-full inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                      <span>Revisar...</span>
                      <ChevronDown className="h-4 w-4 opacity-70 absolute right-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="center">
                    {brandsToFilter.map(([originalBrand, displayBrand]) => (
                      <DropdownMenuItem 
                        key={originalBrand}
                        onClick={() => handleSelectBrand(originalBrand)}
                        className="cursor-pointer font-medium text-sm"
                      >
                        {displayBrand}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : showSingleBrandButton ? (
                <button
                  onClick={() => handleSelectBrand(brandsToFilter[0][0])}
                  className="w-full py-2 px-4 rounded-md text-sm font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  Revisar {brandsToFilter[0][1]}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
