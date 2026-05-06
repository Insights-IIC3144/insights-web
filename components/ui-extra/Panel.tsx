import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, description, action, children, className, bodyClassName }: PanelProps) {
  return (
    <div className={cn("panel", className)}>
      {(title || action) && (
        <div className="panel-header">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("panel-body", bodyClassName)}>{children}</div>
    </div>
  );
}
