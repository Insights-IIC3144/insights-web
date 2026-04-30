import { CURRENT_BRAND } from "@/lib/mock";

interface Props {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
                <div className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                    <span className="chip border-primary/20 bg-primary-muted text-primary">{CURRENT_BRAND}</span>
                    <span>en TheLook eCommerce</span>
                </div>
                <h1 className="font-display text-[26px] font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
