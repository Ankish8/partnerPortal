"use client";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { MessageSquare } from "lucide-react";

interface Props {
  title: string;
  content: string;
  enabled: boolean;
  onClick: () => void;
}

export function EscalationGuidanceChip({ title, content, enabled, onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border pl-2.5 pr-3 py-1.5 text-[12.5px] transition-colors cursor-pointer max-w-full",
              enabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                : "border-border bg-white text-foreground hover:bg-muted/30",
            )}
          />
        }
      >
        <MessageSquare
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            enabled ? "text-emerald-600" : "text-muted-foreground",
          )}
        />
        <span className="truncate max-w-[260px] font-medium">
          {title.trim() || "Untitled"}
        </span>
        {!enabled && (
          <span className="ml-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
            Draft
          </span>
        )}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        className="max-w-[360px] !px-3.5 !py-3"
      >
        <div className="text-left">
          <p className="text-[13px] font-semibold mb-1">{title.trim() || "Untitled"}</p>
          <p className="text-[12.5px] leading-[1.5] text-muted-foreground whitespace-pre-line">
            {content.trim() || "No content yet."}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
