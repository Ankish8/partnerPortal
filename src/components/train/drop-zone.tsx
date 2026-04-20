"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: FileList) => void;
  icon: React.ReactNode;
  primaryText: string;
  secondaryText: string;
  draggingText?: string;
}

export function DropZone({
  accept,
  multiple = true,
  onFiles,
  icon,
  primaryText,
  secondaryText,
  draggingText,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 px-6 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-[#e87537] bg-[#e87537]/5"
          : "border-border/60 hover:border-border hover:bg-muted/20",
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
        {icon}
      </div>
      <p className="text-[14px] font-medium mb-1">
        {isDragging ? (draggingText ?? primaryText) : primaryText}
      </p>
      <p className="text-[12px] text-muted-foreground">{secondaryText}</p>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
        }}
      />
    </div>
  );
}
