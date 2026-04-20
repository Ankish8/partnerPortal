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
import { Mic, Clock, Play } from "lucide-react";

interface UploadingRecording {
  id: string;
  name: string;
  size: number;
  duration: string;
  status: "uploading" | "transcribing" | "ready" | "error";
  progress: number;
}

interface CallRecordingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const ACCEPTED_AUDIO = [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4"];

function randomDuration() {
  const mins = Math.floor(Math.random() * 45) + 1;
  const secs = Math.floor(Math.random() * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function CallRecordingsPanel({
  open,
  onClose,
}: CallRecordingsPanelProps) {
  const [recordings, setRecordings] = useState<UploadingRecording[]>([]);

  const generateUploadUrl = useMutation(api.callRecordings.generateUploadUrl);
  const createRecording = useMutation(api.callRecordings.create);

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = randomDuration();
      const newRec: UploadingRecording = {
        id,
        name: file.name,
        size: file.size,
        duration,
        status: "uploading",
        progress: 0,
      };

      setRecordings((prev) => [...prev, newRec]);

      try {
        const storageId = await uploadFileToConvex(
          () => generateUploadUrl(),
          file,
          (percent) => {
            setRecordings((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, progress: percent } : r
              )
            );
          }
        );

        setRecordings((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "transcribing", progress: 100 } : r
          )
        );

        await createRecording({
          name: file.name,
          size: file.size,
          duration,
          storageId: storageId as Id<"_storage">,
        });

        setRecordings((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "ready" } : r
          )
        );
      } catch {
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "error" } : r
          )
        );
      }
    },
    [generateUploadUrl, createRecording]
  );

  const handleFiles = useCallback(
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => uploadFile(file));
    },
    [uploadFile]
  );

  const removeRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const readyCount = recordings.filter((r) => r.status === "ready").length;

  const handleClose = () => {
    setRecordings([]);
    onClose();
  };

  return (
    <SlidePanel open={open} onClose={handleClose} title="Add calls" learnMoreHref="#">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Description */}
        <div className="px-6 pt-2 pb-5">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Upload calls to automatically transcribe and use as knowledge for your AI agent.
            Supported formats: MP3, WAV, M4A, OGG, WebM, MP4.
          </p>
        </div>

        {/* Upload area */}
        <div className="px-6 pb-5">
          <DropZone
            accept={ACCEPTED_AUDIO.join(",")}
            onFiles={handleFiles}
            icon={<Mic className="h-5 w-5 text-muted-foreground" />}
            primaryText="Click to upload or drag and drop"
            draggingText="Drop recordings here"
            secondaryText="MP3, WAV, M4A, OGG, WebM, MP4 up to 100MB each"
          />
        </div>

        {/* Recording list */}
        {recordings.length > 0 && (
          <div className="flex-1 overflow-y-auto border-t border-border/60">
            <div className="px-6 py-3">
              <span className="text-[13px] font-medium text-muted-foreground">
                {recordings.length} recording{recordings.length !== 1 ? "s" : ""} selected
                {readyCount > 0 && ` · ${readyCount} transcribed`}
              </span>
            </div>
            <div className="px-6 pb-4 space-y-2">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted/60">
                    {rec.status === "ready" ? (
                      <Play className="h-4 w-4 text-muted-foreground ml-0.5" />
                    ) : (
                      <Mic className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">
                      {rec.name}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span>{formatFileSize(rec.size)}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rec.duration}
                      </span>
                    </div>
                    {rec.status === "uploading" && (
                      <UploadProgress progress={rec.progress} className="mt-1.5" />
                    )}
                  </div>
                  <UploadStatusIndicator
                    status={rec.status}
                    onRemove={() => removeRecording(rec.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {recordings.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[13px] text-muted-foreground">
              No recordings added yet. Upload audio files to get started.
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
