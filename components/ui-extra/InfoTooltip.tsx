import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface Props {
  text: string;
  direction?: "up" | "left";
}

const SIDE = { up: "top" as const, left: "left" as const };

export function InfoTooltip({ text, direction = "up" }: Props) {
  const side = SIDE[direction];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span />} className="inline-flex">
          <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
        </TooltipTrigger>
        <TooltipContent side={side} className="w-52 leading-relaxed">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
