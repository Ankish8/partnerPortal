"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Play,
  Trash2,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatFileSize } from "@/lib/utils";

export default function CallRecordingsPage() {
  const router = useRouter();
  const recordings = useQuery(api.callRecordings.list);
  const removeRecording = useMutation(api.callRecordings.remove);

  const loading = recordings === undefined;

  if (!loading && recordings.length === 0) {
    return (
      <ContentPanel>
        <div className="flex flex-col items-center justify-center h-full py-32 px-6 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <Phone className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-[17px] font-semibold mb-2">No call recordings</h2>
          <p className="text-[14px] text-muted-foreground mb-6 max-w-md">
            Upload call recordings to automatically extract customer intents and conversation patterns.
          </p>
          <Button
            onClick={() => router.push("/train")}
            className="rounded-lg bg-foreground text-white hover:bg-foreground/90"
          >
            Go to Knowledge Sources
          </Button>
        </div>
      </ContentPanel>
    );
  }

  return (
    <ContentPanel>
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="h-5 w-5 text-green-600" />
            <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">Calls</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload call recordings to automatically extract customer intents and conversation patterns.
          </p>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && recordings.length > 0 && (
          <div className="space-y-3">
            {recordings.map((rec) => (
              <Card key={rec._id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                      <Play className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rec.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        {rec.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {rec.duration}
                          </span>
                        )}
                        <span>{formatFileSize(rec.size)}</span>
                        <span>Uploaded {new Date(rec.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={rec.status === "ready" ? "success" : "outline"}>
                      {rec.status === "ready" ? (
                        <><CheckCircle2 /> Ready</>
                      ) : (
                        <><Loader2 className="animate-spin" /> Processing</>
                      )}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeRecording({ id: rec._id })}
                      className="cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ContentPanel>
  );
}
