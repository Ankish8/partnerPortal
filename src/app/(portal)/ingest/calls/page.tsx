"use client";

import { Button, Card, Chip } from "@heroui/react";
import {
  Phone,
  Upload,
  Play,
  Trash2,
  CheckCircle2,
  Loader2,
  Clock,
  Brain,
} from "lucide-react";

interface CallRecording {
  id: string;
  name: string;
  duration: string;
  status: "transcribing" | "analyzing" | "completed";
  intentsFound: number;
  uploadedAt: string;
}

const mockCalls: CallRecording[] = [
  {
    id: "1",
    name: "Customer Support Call #1042",
    duration: "12:34",
    status: "completed",
    intentsFound: 3,
    uploadedAt: "3 hours ago",
  },
  {
    id: "2",
    name: "Sales Inquiry - John D.",
    duration: "8:15",
    status: "analyzing",
    intentsFound: 0,
    uploadedAt: "20 minutes ago",
  },
];

export default function CallRecordingsPage() {
  const statusConfig = {
    transcribing: { label: "Transcribing", color: "warning" as const, icon: Loader2 },
    analyzing: { label: "Analyzing intents", color: "warning" as const, icon: Brain },
    completed: { label: "Completed", color: "success" as const, icon: CheckCircle2 },
  };

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Phone className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-bold text-foreground">Call Recordings</h1>
        </div>
        <p className="text-sm text-muted">
          Upload call recordings to automatically extract customer intents and conversation patterns.
        </p>
      </div>

      {/* Upload area */}
      <Card className="mb-6 p-8 border-2 border-dashed border-default text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
        <Phone className="mx-auto mb-3 h-10 w-10 text-muted" />
        <p className="text-sm font-medium text-foreground">Upload call recordings</p>
        <p className="mt-1 text-xs text-muted">Supports MP3, WAV, M4A, OGG (max 200MB per file)</p>
        <Button className="mt-4" variant="outline" size="sm">
          <Upload className="h-3.5 w-3.5" />
          Browse Files
        </Button>
      </Card>

      {/* Call list */}
      <div className="space-y-3">
        {mockCalls.map((call) => {
          const status = statusConfig[call.status];
          const StatusIcon = status.icon;
          return (
            <Card key={call.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Play className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{call.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {call.duration}
                    </span>
                    {call.intentsFound > 0 && (
                      <span className="flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        {call.intentsFound} intents detected
                      </span>
                    )}
                    <span>Uploaded {call.uploadedAt}</span>
                  </div>
                </div>
                <Chip
                  size="sm"
                  variant="soft"
                  color={status.color}
                >
                  <StatusIcon className={`h-3 w-3 ${call.status !== "completed" ? "animate-spin" : ""}`} /> {status.label}
                </Chip>
                <Button size="sm" variant="ghost" isIconOnly>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
