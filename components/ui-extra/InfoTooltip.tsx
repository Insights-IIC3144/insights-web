import { Info } from "lucide-react";

interface Props {
  text: string;
  direction?: "up" | "left";
}

export function InfoTooltip({ text, direction = "up" }: Props) {
  const positionClass =
    direction === "left"
      ? "right-full top-1/2 -translate-y-1/2 mr-2"
      : "bottom-full left-1/2 -translate-x-1/2 mb-2";

  return (
    <div className="relative group inline-flex">
      <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
      <div
        className={`absolute ${positionClass} w-52 rounded-md bg-popover border border-border px-2.5 py-2 text-xs text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed`}
      >
        {text}
      </div>
    </div>
  );
}
