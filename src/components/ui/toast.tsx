"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "accent" | "success" | "warning" | "danger";

type ToastData = {
  variant?: ToastVariant;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    variant?: "solid" | "outline";
  };
  dismissible?: boolean;
};

function ToastProvider({
  children,
  limit = 3,
  timeout = 4000,
}: {
  children: React.ReactNode;
  limit?: number;
  timeout?: number;
}) {
  return (
    <ToastPrimitive.Provider limit={limit} timeout={timeout}>
      {children}
      <ToastViewport />
    </ToastPrimitive.Provider>
  );
}

function ToastViewport() {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>();

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col-reverse items-center gap-2"
        )}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

const variantIconStyles: Record<ToastVariant, string> = {
  default: "text-foreground/70",
  accent: "text-sky-600",
  success: "text-emerald-600",
  warning: "text-amber-500",
  danger: "text-rose-500",
};

function defaultIconFor(variant: ToastVariant): React.ReactNode {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-[18px] w-[18px]" />;
    case "warning":
      return <AlertTriangle className="h-[18px] w-[18px]" />;
    case "danger":
      return <AlertCircle className="h-[18px] w-[18px]" />;
    case "accent":
    case "default":
    default:
      return <Info className="h-[18px] w-[18px]" />;
  }
}

function ToastItem({
  toast,
}: {
  toast: ReturnType<typeof ToastPrimitive.useToastManager<ToastData>>["toasts"][number];
}) {
  const variant = toast.data?.variant ?? "default";
  const icon = toast.data?.icon ?? defaultIconFor(variant);
  const action = toast.data?.action;
  const dismissible = toast.data?.dismissible ?? true;

  return (
    <ToastPrimitive.Root
      toast={toast}
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-full border border-border/60 bg-white px-4 py-2.5",
        "shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.03]",
        "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[starting-style]:translate-y-3 data-[starting-style]:opacity-0",
        "data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0"
      )}
    >
      <span className={cn("flex shrink-0 items-center justify-center", variantIconStyles[variant])}>
        {icon}
      </span>

      <div className="flex min-w-0 items-baseline gap-2">
        {toast.title && (
          <ToastPrimitive.Title className="text-[13.5px] font-semibold text-foreground">
            {toast.title}
          </ToastPrimitive.Title>
        )}
        {toast.description && (
          <ToastPrimitive.Description className="text-[13px] text-muted-foreground">
            {toast.description}
          </ToastPrimitive.Description>
        )}
      </div>

      {action && (
        <ToastPrimitive.Action
          onClick={action.onClick}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors",
            action.variant === "outline"
              ? "border border-border text-foreground hover:bg-muted"
              : "bg-foreground text-background hover:bg-foreground/90"
          )}
        >
          {action.label}
        </ToastPrimitive.Action>
      )}

      {dismissible && !action && (
        <ToastPrimitive.Close
          aria-label="Dismiss"
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </ToastPrimitive.Close>
      )}
    </ToastPrimitive.Root>
  );
}

function useToast() {
  return ToastPrimitive.useToastManager<ToastData>();
}

export { ToastProvider, ToastViewport, useToast };
export type { ToastVariant, ToastData };
