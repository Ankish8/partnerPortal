"use client";

import { useEffect, useState } from "react";
import { X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  learnMoreHref?: string;
  panelClassName?: string;
  disableBackdropClose?: boolean;
  customHeader?: React.ReactNode;
}

export function SlidePanel({
  open,
  onClose,
  title,
  children,
  learnMoreHref,
  panelClassName,
  disableBackdropClose,
  customHeader,
}: SlidePanelProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount panel then trigger slide-in animation next frame
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={disableBackdropClose ? undefined : onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative flex flex-col bg-white rounded-2xl shadow-2xl m-2 w-[780px] max-w-[calc(100vw-280px)] transition-all duration-300 ease-out",
          panelClassName,
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        {customHeader || (
          <div className="flex items-center justify-between px-6 py-5 shrink-0">
            <h2 className="text-[17px] font-semibold">{title}</h2>
            <div className="flex items-center gap-3">
              {learnMoreHref && (
                <button className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                  <BookOpen className="h-3.5 w-3.5" />
                  Learn more
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-[18px] w-[18px] text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
