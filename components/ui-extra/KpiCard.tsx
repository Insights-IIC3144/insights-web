import { ArrowDown, ArrowUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    label: string;
    value: string;
    delta?: number; // percentage change vs previous period
    hint?: string;
    icon?: React.ReactNode;
    tooltip?: React.ReactNode;
}

export function KpiCard({ label, value, delta, hint, icon, tooltip }: KpiCardProps) {
    const positive = (delta ?? 0) >= 0;
    return (
        <div className="kpi-card">
            <div className="flex items-start justify-between gap-2">
                {tooltip ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger
                                render={<div className="text-xs uppercase tracking-wider text-muted-foreground font-medium cursor-help" />}
                            >
                                {label}
                            </TooltipTrigger>
                            <TooltipContent>{tooltip}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        {label}
                    </div>
                )}
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular text-foreground">
                {value}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs">
                {delta !== undefined && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 font-medium tabular",
                            positive ? "text-success" : "text-destructive",
                        )}
                    >
                        {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(delta).toFixed(1)}%
                    </span>
                )}
                {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
        </div>
    );
}
