import { ArrowDown, ArrowUp } from "lucide-react";
import { cn, pctChange, invertPctChange } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui-extra/InfoTooltip";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface KpiCardProps {
    label: string;
    value?: number;
    format: (value: number) => string;
    prior?: number;
    delta?: number;
    hint?: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

function resolveDelta(value?: number, prior?: number, delta?: number): number | undefined {
    return delta ?? (value !== undefined && prior !== undefined ? pctChange(value, prior) : undefined);
}

function resolvePrior(value?: number, delta?: number, prior?: number): number | undefined {
    return prior ?? (value !== undefined && delta !== undefined ? invertPctChange(value, delta) : undefined);
}

export function KpiCard({ label, value, format, prior, delta, hint, icon, tooltip }: KpiCardProps) {
    const effectiveDelta = resolveDelta(value, prior, delta);
    const effectivePrior = resolvePrior(value, effectiveDelta, prior);
    const positive = (effectiveDelta ?? 0) >= 0;
    const absDelta = effectiveDelta !== undefined ? Math.abs(effectiveDelta) : 0;

    return (
        <div className="kpi-card">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {label}
                    {tooltip && <InfoTooltip text={tooltip} />}
                </div>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight tabular text-foreground">
                {value !== undefined ? format(value) : "-"}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs">
                {effectiveDelta !== undefined && (
                    value !== undefined && effectivePrior !== undefined ? (
                        <DeltaTooltip
                            positive={positive}
                            delta={absDelta}
                            format={format}
                            value={value}
                            effectivePrior={effectivePrior}
                            isEstimated={prior === undefined}
                        />
                    ) : (
                        <span
                            className={cn(
                                "inline-flex items-center gap-0.5 font-medium tabular",
                                positive ? "text-success" : "text-destructive",
                            )}
                        >
                            <DeltaArrow positive={positive} delta={absDelta} />
                        </span>
                    )
                )}
                {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
        </div>
    );
}

function DeltaArrow({ positive, delta }: { positive: boolean; delta: number }) {
    return (
        <>
            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {delta.toFixed(1)}%
        </>
    );
}

function DeltaTooltip({ positive, delta, format, value, effectivePrior, isEstimated }: {
    positive: boolean;
    delta: number;
    format: (v: number) => string;
    value: number;
    effectivePrior: number;
    isEstimated: boolean;
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger
                    render={<span />}
                    className={cn(
                        "inline-flex items-center gap-0.5 font-medium tabular",
                        positive ? "text-success" : "text-destructive",
                    )}
                >
                    <DeltaArrow positive={positive} delta={delta} />
                </TooltipTrigger>
                <TooltipContent>
                    Se experimentó una {positive ? "subida" : "bajada"} del {delta.toFixed(1)}%. El valor de este período es de {format(value)} mientras que el del anterior fue de {isEstimated ? "~" : ""}{format(effectivePrior)}.
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
