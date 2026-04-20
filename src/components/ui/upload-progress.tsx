"use client";

import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  className?: string;
}

export function UploadProgress({ progress, className }: UploadProgressProps) {
  return (
    <div
      className={cn(
        "h-1 w-full rounded-full bg-muted overflow-hidden",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-[#e87537] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
