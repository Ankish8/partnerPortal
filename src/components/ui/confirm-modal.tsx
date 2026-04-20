"use client";

import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  cancelLabel = "Keep editing",
  confirmLabel = "Discard",
  confirmVariant = "default",
}: ConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogPopup className="!p-0 max-w-[460px] overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <AlertDialogTitle className="text-[20px] font-semibold tracking-tight">
            {title}
          </AlertDialogTitle>
        </div>
        <div className="border-t border-dashed border-border/80" />
        <div className="px-6 py-5">
          <AlertDialogDescription className="!mt-0 text-[14.5px] leading-[1.55] text-foreground/75">
            {description}
          </AlertDialogDescription>
        </div>
        <div className="border-t border-dashed border-border/80" />
        <div className="flex items-center justify-end gap-2 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full h-9 px-4 text-[13.5px] font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "inline-flex items-center rounded-full h-9 px-4 text-[13.5px] font-medium transition-colors cursor-pointer",
              confirmVariant === "destructive"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-foreground text-background hover:bg-foreground/90"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
