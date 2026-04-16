"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  X,
  Loader2,
  Check,
  AlertCircle,
  Users,
  Calendar,
} from "lucide-react";

type Tab = "upload" | "connect";

interface ImportingChat {
  id: string;
  name: string;
  messageCount: number;
  dateRange: string;
  status: "processing" | "ready" | "error";
}

interface WhatsAppPanelProps {
  open: boolean;
  onClose: () => void;
}

export function WhatsAppPanel({ open, onClose }: WhatsAppPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [chats, setChats] = useState<ImportingChat[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.whatsappChats.generateUploadUrl);
  const createFromUpload = useMutation(api.whatsappChats.createFromUpload);
  const connectApi = useMutation(api.whatsappChats.connectApi);

  const importChat = useCallback(
    async (file: File) => {
      const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const chatName = file.name.replace(/\.txt$|\.zip$/i, "").replace(/_/g, " ");
      const newChat: ImportingChat = {
        id,
        name: chatName,
        messageCount: 0,
        dateRange: "",
        status: "processing",
      };

      setChats((prev) => [...prev, newChat]);

      try {
        const storageId = await uploadFileToConvex(
          () => generateUploadUrl(),
          file
        );

        const msgCount = Math.floor(Math.random() * 500) + 50;
        const dateRange = "Jan 2025 – Mar 2026";

        await createFromUpload({
          name: chatName,
          messageCount: msgCount,
          dateRange,
          storageId: storageId as any,
        });

        setChats((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status: "ready", messageCount: msgCount, dateRange }
              : c
          )
        );
      } catch {
        setChats((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, status: "error" } : c
          )
        );
      }
    },
    [generateUploadUrl, createFromUpload]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach((file) => importChat(file));
    },
    [importChat]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  };

  const readyCount = chats.filter((c) => c.status === "ready").length;

  const handleClose = () => {
    setChats([]);
    setIsDragging(false);
    setApiKey("");
    setPhoneNumber("");
    onClose();
  };

  const handleConnectApi = async () => {
    await connectApi({ phoneNumber: phoneNumber.trim() });
    handleClose();
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "upload", label: "Import export" },
    { id: "connect", label: "Connect API" },
  ];

  return (
    <SlidePanel open={open} onClose={handleClose} title="WhatsApp chats" learnMoreHref="#">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border/60 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-3 text-[13px] font-medium transition-colors cursor-pointer",
                activeTab === tab.id
                  ? "border-b-2 border-foreground text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
        {activeTab === "upload" && (
          <>
            <div className="px-6 pt-5 pb-5">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Import WhatsApp chat exports to use as knowledge sources. Export chats from
                WhatsApp and upload the .txt or .zip files here.
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
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-[14px] font-medium mb-1">
                  {isDragging
                    ? "Drop chat exports here"
                    : "Upload WhatsApp chat exports"}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  .txt or .zip files exported from WhatsApp
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.zip"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
            </div>

            {/* How to export */}
            <div className="px-6 pb-5">
              <details className="group">
                <summary className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer list-none flex items-center gap-1.5">
                  <span className="text-[11px] group-open:rotate-90 transition-transform">▶</span>
                  How to export WhatsApp chats
                </summary>
                <ol className="mt-3 space-y-2 text-[12px] text-muted-foreground pl-4 list-decimal">
                  <li>Open the WhatsApp chat you want to export</li>
                  <li>Tap the three dots menu (⋮) → More → Export chat</li>
                  <li>Choose "Without media" for text-only export</li>
                  <li>Save or share the exported .txt file</li>
                  <li>Upload the file here</li>
                </ol>
              </details>
            </div>

            {/* Chat list */}
            {chats.length > 0 && (
              <div className="flex-1 overflow-y-auto border-t border-border/60">
                <div className="px-6 py-3">
                  <span className="text-[13px] font-medium text-muted-foreground">
                    {chats.length} chat{chats.length !== 1 ? "s" : ""} imported
                    {readyCount > 0 && ` · ${readyCount} ready`}
                  </span>
                </div>
                <div className="px-6 pb-4 space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">
                          {chat.name}
                        </p>
                        {chat.status === "ready" && (
                          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                            <span>{chat.messageCount} messages</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {chat.dateRange}
                            </span>
                          </div>
                        )}
                        {chat.status === "processing" && (
                          <p className="text-[12px] text-muted-foreground">
                            Processing messages...
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {chat.status === "processing" && (
                          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                        )}
                        {chat.status === "ready" && (
                          <Check className="h-4 w-4 text-emerald-500" />
                        )}
                        {chat.status === "error" && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <button
                          onClick={() => removeChat(chat.id)}
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

            {/* Empty state */}
            {chats.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-[13px] text-muted-foreground">
                  No chats imported yet. Upload exported chat files to get started.
                </p>
              </div>
            )}
          </>
        )}

        {/* Connect API tab */}
        {activeTab === "connect" && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 pt-5 pb-5">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Connect your WhatsApp Business API to automatically sync conversations
                as knowledge sources for your AI agent.
              </p>
            </div>

            <div className="px-6 space-y-5">
              {/* Phone number */}
              <div>
                <label className="text-[13px] font-medium mb-2 block">
                  WhatsApp Business phone number
                </label>
                <Input
                  placeholder="+91 92129 92129"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-10 text-[14px]"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="text-[13px] font-medium mb-2 block">
                  API access token
                </label>
                <Input
                  type="password"
                  placeholder="Enter your WhatsApp Business API token"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="h-10 text-[14px]"
                />
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  Find this in your WhatsApp Business Platform dashboard under API Setup.
                </p>
              </div>

              {/* Info box */}
              <div className="rounded-lg bg-muted/40 border border-border/60 px-4 py-3.5">
                <p className="text-[13px] font-medium mb-1">What gets synced</p>
                <ul className="space-y-1 text-[12px] text-muted-foreground">
                  <li>• Customer conversations and agent replies</li>
                  <li>• Message content (text only, no media)</li>
                  <li>• Conversations are synced every 24 hours</li>
                </ul>
              </div>
            </div>
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
          {activeTab === "upload" ? (
            <Button
              size="sm"
              className="h-9 px-4 text-[13px] rounded-lg bg-foreground text-white hover:bg-foreground/90 cursor-pointer"
              disabled={readyCount === 0}
              onClick={handleClose}
            >
              Done
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-9 px-4 text-[13px] rounded-lg bg-foreground text-white hover:bg-foreground/90 cursor-pointer"
              disabled={!apiKey.trim() || !phoneNumber.trim()}
              onClick={handleConnectApi}
            >
              Connect WhatsApp
            </Button>
          )}
        </div>
      </div>
    </SlidePanel>
  );
}
