"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize } from "@/lib/utils";
import {
  FileText,
  Upload,
  X,
  File,
  FileType,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "processing" | "ready" | "error";
  progress: number;
}

interface DocumentsPanelProps {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = [
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".md",
  ".csv",
  ".xlsx",
  ".xls",
  ".pptx",
];

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileType className="h-5 w-5 text-red-500" />;
  if (["doc", "docx"].includes(ext || ""))
    return <FileType className="h-5 w-5 text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(ext || ""))
    return <FileType className="h-5 w-5 text-emerald-500" />;
  if (["pptx"].includes(ext || ""))
    return <FileType className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export function DocumentsPanel({ open, onClose }: DocumentsPanelProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newFile: UploadingFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      };

      setFiles((prev) => [...prev, newFile]);

      try {
        const storageId = await uploadFileToConvex(
          () => generateUploadUrl(),
          file,
          (percent) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, progress: percent } : f
              )
            );
          }
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "processing", progress: 100 } : f
          )
        );

        await createDocument({
          name: file.name,
          size: file.size,
          type: file.type,
          storageId: storageId as any,
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "ready" } : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "error" } : f
          )
        );
      }
    },
    [generateUploadUrl, createDocument]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const readyCount = files.filter((f) => f.status === "ready").length;

  const handleClose = () => {
    setFiles([]);
    setIsDragging(false);
    onClose();
  };

  return (
    <SlidePanel open={open} onClose={handleClose} title="Add documents" learnMoreHref="#">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Description */}
        <div className="px-6 pt-2 pb-5">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Upload documents to use as knowledge sources for your AI agent.
            Supported formats: PDF, DOCX, TXT, MD, CSV, XLSX, PPTX.
          </p>
        </div>

        {/* Upload area */}
        <div className="px-6 pb-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 px-6 text-center transition-colors cursor-pointer",
              isDragging
                ? "border-[#e87537] bg-[#e87537]/5"
                : "border-border/60 hover:border-border hover:bg-muted/20"
            )}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-[14px] font-medium mb-1">
              {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              PDF, DOCX, TXT, MD, CSV, XLSX, PPTX up to 25MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex-1 overflow-y-auto border-t border-border/60">
            <div className="px-6 py-3">
              <span className="text-[13px] font-medium text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
                {readyCount > 0 && ` · ${readyCount} ready`}
              </span>
            </div>
            <div className="px-6 pb-4 space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3"
                >
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === "uploading" && (
                      <div className="mt-1.5 h-1 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#e87537] transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    {file.status === "uploading" && (
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                    )}
                    {file.status === "processing" && (
                      <span className="text-[11px] text-muted-foreground">Processing...</span>
                    )}
                    {file.status === "ready" && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no files */}
        {files.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-[13px] text-muted-foreground">
              No documents added yet. Upload files to get started.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 border-t border-border/60 px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-[13px] rounded-lg cursor-pointer"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 px-4 text-[13px] rounded-lg bg-foreground text-white hover:bg-foreground/90 cursor-pointer"
            disabled={readyCount === 0}
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      </div>
    </SlidePanel>
  );
}
