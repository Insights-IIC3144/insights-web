import { cn } from "@/lib/utils";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, actions, className, children }: Props) {
  return (
    <div className={cn("panel p-5", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
