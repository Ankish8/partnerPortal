"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Trash2,
  CheckCircle2,
  Loader2,
  Users,
} from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

export default function WhatsAppPage() {
  const router = useRouter();
  const chats = useQuery(api.whatsappChats.list);
  const removeChat = useMutation(api.whatsappChats.remove);

  const loading = chats === undefined;

  if (!loading && chats.length === 0) {
    return (
      <ContentPanel>
        <div className="flex flex-col items-center justify-center h-full py-32 px-6 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h2 className="text-[17px] font-semibold mb-2">No WhatsApp chats imported</h2>
          <p className="text-[14px] text-muted-foreground mb-6 max-w-md">
            Import exported WhatsApp chats to learn from real customer interactions.
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
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.03em]">WhatsApp Conversations</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Import exported WhatsApp chats to learn from real customer interactions.
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

        {!loading && chats.length > 0 && (
          <div className="space-y-3">
            {chats.map((chat) => (
              <Card key={chat._id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{chat.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {chat.messageCount} messages
                        </span>
                        {chat.dateRange && <span>{chat.dateRange}</span>}
                        <span>Uploaded {new Date(chat.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge className={chat.status === "ready" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-amber-100 text-amber-700 hover:bg-amber-100"}>
                      {chat.status === "ready" ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Ready</>
                      ) : (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</>
                      )}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeChat({ id: chat._id })}
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
