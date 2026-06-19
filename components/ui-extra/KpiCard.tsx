import { ArrowDown, ArrowUp } from "lucide-react";
import { cn, pctChange } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui-extra/InfoTooltip";

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

export function KpiCard({ label, value, format, prior, delta, hint, icon, tooltip }: KpiCardProps) {
    const effectiveDelta = delta ?? (value !== undefined && prior !== undefined ? pctChange(value, prior) : undefined);
    const positive = (effectiveDelta ?? 0) >= 0;
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
                {value !== undefined ? format(value) : "\u2014"}
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs">
                {effectiveDelta !== undefined && (
                    <span
                        className={cn(
                            "inline-flex items-center gap-0.5 font-medium tabular",
                            positive ? "text-success" : "text-destructive",
                        )}
                    >
                        {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(effectiveDelta).toFixed(1)}%
                    </span>
                )}
                {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
        </div>
    );
}
