"use client";

import { Button, Card, Chip } from "@heroui/react";
import {
  MessageSquare,
  Upload,
  Trash2,
  CheckCircle2,
  Loader2,
  Users,
  Brain,
} from "lucide-react";

interface WhatsAppChat {
  id: string;
  name: string;
  messageCount: number;
  status: "processing" | "completed";
  intentsFound: number;
  uploadedAt: string;
}

const mockChats: WhatsAppChat[] = [
  {
    id: "1",
    name: "Customer Support Group",
    messageCount: 1248,
    status: "completed",
    intentsFound: 8,
    uploadedAt: "1 day ago",
  },
  {
    id: "2",
    name: "Sales Inquiries",
    messageCount: 456,
    status: "processing",
    intentsFound: 0,
    uploadedAt: "30 minutes ago",
  },
];

export default function WhatsAppPage() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-foreground">WhatsApp Conversations</h1>
        </div>
        <p className="text-sm text-muted">
          Import exported WhatsApp chats to learn from real customer interactions.
        </p>
      </div>

      {/* Upload area */}
      <Card className="mb-6 p-8 border-2 border-dashed border-default text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
        <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted" />
        <p className="text-sm font-medium text-foreground">Upload WhatsApp chat export</p>
        <p className="mt-1 text-xs text-muted">Export chats from WhatsApp and upload the .txt or .zip file</p>
        <Button className="mt-4" variant="outline" size="sm">
          <Upload className="h-3.5 w-3.5" />
          Upload Chat Export
        </Button>
      </Card>

      {/* Chat list */}
      <div className="space-y-3">
        {mockChats.map((chat) => (
          <Card key={chat.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{chat.name}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {chat.messageCount} messages
                  </span>
                  {chat.intentsFound > 0 && (
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {chat.intentsFound} intents detected
                    </span>
                  )}
                  <span>Uploaded {chat.uploadedAt}</span>
                </div>
              </div>
              <Chip
                size="sm"
                variant="soft"
                color={chat.status === "completed" ? "success" : "warning"}
              >
                {chat.status === "completed" ? (
                  <><CheckCircle2 className="h-3 w-3" /> Analyzed</>
                ) : (
                  <><Loader2 className="h-3 w-3 animate-spin" /> Processing</>
                )}
              </Chip>
              <Button size="sm" variant="ghost" isIconOnly>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
