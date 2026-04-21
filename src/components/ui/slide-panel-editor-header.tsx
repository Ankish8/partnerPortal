"use client";

import { X, Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Props {
  title: string;
  onTitleChange: (value: string) => void;
  titlePlaceholder?: string;
  enabled: boolean;
  canEnable: boolean;
  canSave: boolean;
  onEnable: () => void;
  onSave: () => void;
  onClose: () => void;
  emptyReason?: string | null;
  saveDisabledReason?: string | null;
  showOpenPreview?: boolean;
  onOpenPreview?: () => void;
}

export function SlidePanelEditorHeader({
  title,
  onTitleChange,
  titlePlaceholder = "Untitled",
  enabled,
  canEnable,
  canSave,
  onEnable,
  onSave,
  onClose,
  emptyReason,
  saveDisabledReason,
  showOpenPreview = false,
  onOpenPreview,
}: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-border/40">
      <div className="flex items-center min-w-0">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          size={Math.max((title || titlePlaceholder).length, 8)}
          className="text-[17px] font-semibold bg-transparent outline-none border-b border-dotted border-muted-foreground/50"
        />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {showOpenPreview && onOpenPreview && (
          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 rounded-full h-8 px-3.5 text-[13px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            Open preview
          </button>
        )}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onEnable}
                aria-disabled={!canEnable}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full h-8 px-3.5 text-[13px] font-medium transition-colors",
                  !canEnable
                    ? "bg-secondary text-secondary-foreground/60 cursor-not-allowed"
                    : enabled
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
                )}
              />
            }
          >
            <Play className="h-3 w-3 fill-current" />
            {enabled ? "Disable" : "Enable"}
          </TooltipTrigger>
          {!canEnable && emptyReason && (
            <TooltipContent>{emptyReason}</TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={onSave}
                aria-disabled={!canSave}
                className={cn(
                  "inline-flex items-center rounded-full h-8 px-3.5 text-[13px] font-medium transition-colors",
                  canSave
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                    : "bg-secondary text-secondary-foreground/60 cursor-not-allowed",
                )}
              />
            }
          >
            Save
          </TooltipTrigger>
          {!canSave && saveDisabledReason && (
            <TooltipContent>{saveDisabledReason}</TooltipContent>
          )}
        </Tooltip>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
