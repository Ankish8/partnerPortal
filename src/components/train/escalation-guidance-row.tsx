"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { modeLabel } from "./escalation-meta-selects";

interface Props {
  title: string;
  content: string;
  enabled: boolean;
  mode?: string;
  used: number;
  resolved?: number;
  escalated?: number;
  isLast: boolean;
  onClick: () => void;
}

export function EscalationGuidanceRow({
  title,
  content,
  enabled,
  mode,
  used,
  resolved,
  escalated,
  isLast,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left grid grid-cols-[1fr_80px_60px_80px_80px] items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer",
        !isLast && "border-b border-border",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-medium truncate">
            {title.trim() || "Untitled"}
          </p>
          <Badge variant="outline" className="shrink-0 !text-[10.5px] !py-0 !px-1.5 !h-[18px]">
            {modeLabel(mode ?? "immediate")}
          </Badge>
        </div>
        <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
          {content.trim() || "No content yet."}
        </p>
      </div>
      <div>
        <Badge variant={enabled ? "success" : "outline"}>
          {enabled ? "Live" : "Draft"}
        </Badge>
      </div>
      <span className="text-[14px] text-muted-foreground">{used}</span>
      <span className="text-[14px] text-muted-foreground">
        {resolved ?? 0}
      </span>
      <span className="text-[14px] text-muted-foreground">
        {escalated ?? 0}
      </span>
    </button>
  );
}
