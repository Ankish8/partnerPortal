"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/train/drop-zone";
import { UploadStatusIndicator } from "@/components/ui/upload-status";
import { UploadProgress } from "@/components/ui/upload-progress";
import { SlidePanelFooter } from "@/components/ui/slide-panel-footer";
import { formatFileSize } from "@/lib/utils";
import { Upload, File, FileType } from "lucide-react";

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
  if (ext === "pdf" || ["doc", "docx", "xls", "xlsx", "csv", "pptx"].includes(ext || ""))
    return <FileType className="h-5 w-5 text-muted-foreground" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export function DocumentsPanel({ open, onClose }: DocumentsPanelProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);

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
          storageId: storageId as Id<"_storage">,
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
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const readyCount = files.filter((f) => f.status === "ready").length;

  const handleClose = () => {
    setFiles([]);
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
          <DropZone
            accept={ACCEPTED_TYPES.join(",")}
            onFiles={handleFiles}
            icon={<Upload className="h-5 w-5 text-muted-foreground" />}
            primaryText="Click to upload or drag and drop"
            draggingText="Drop files here"
            secondaryText="PDF, DOCX, TXT, MD, CSV, XLSX, PPTX up to 25MB each"
          />
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
                      <UploadProgress progress={file.progress} className="mt-1.5" />
                    )}
                  </div>
                  <UploadStatusIndicator
                    status={file.status}
                    onRemove={() => removeFile(file.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no files */}
        {files.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[13px] text-muted-foreground">
              No documents added yet. Upload files to get started.
            </p>
          </div>
        )}

        <SlidePanelFooter>
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
        </SlidePanelFooter>
      </div>
    </SlidePanel>
  );
}
