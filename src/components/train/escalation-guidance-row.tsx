"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  content: string;
  enabled: boolean;
  used: number;
  escalated?: number;
  isLast: boolean;
  onClick: () => void;
}

export function EscalationGuidanceRow({
  title,
  content,
  enabled,
  used,
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
        <p className="text-[14px] font-medium truncate">
          {title.trim() || "Untitled"}
        </p>
        <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
          {content.trim() || "No content yet."}
        </p>
      </div>
      <div>
        <Badge
          variant="outline"
          className={cn(
            "text-[12px] font-normal",
            enabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "",
          )}
        >
          {enabled ? "Live" : "Draft"}
        </Badge>
      </div>
      <span className="text-[14px] text-muted-foreground">{used}</span>
      <span className="text-[14px] text-muted-foreground">—</span>
      <span className="text-[14px] text-muted-foreground">
        {escalated !== undefined ? escalated : "—"}
      </span>
    </button>
  );
}
