"use client";

import { Loader2, Check, AlertCircle, X } from "lucide-react";

export type UploadStatus = "uploading" | "processing" | "transcribing" | "ready" | "error";

interface UploadStatusIndicatorProps {
  status: UploadStatus;
  onRemove?: () => void;
  processingLabel?: string;
}

export function UploadStatusIndicator({
  status,
  onRemove,
  processingLabel,
}: UploadStatusIndicatorProps) {
  return (
    <div className="shrink-0 flex items-center gap-2">
      {status === "uploading" && (
        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
      )}
      {status === "processing" && (
        <span className="text-[11px] text-muted-foreground">
          {processingLabel ?? "Processing..."}
        </span>
      )}
      {status === "transcribing" && (
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          {processingLabel ?? "Transcribing"}
        </span>
      )}
      {status === "ready" && <Check className="h-4 w-4 text-emerald-500" />}
      {status === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
