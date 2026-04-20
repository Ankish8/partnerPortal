"use client";

import { cn } from "@/lib/utils";

interface SlidePanelFooterProps {
  children: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
}

export function SlidePanelFooter({
  children,
  leading,
  className,
}: SlidePanelFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/60 px-6 py-4 flex items-center gap-3",
        leading ? "justify-between" : "justify-end",
        className
      )}
    >
      {leading}
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
