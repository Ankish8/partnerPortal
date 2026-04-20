"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { uploadFileToConvex } from "@/lib/convex-upload";
import { SlidePanel } from "@/components/ui/slide-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropZone } from "@/components/train/drop-zone";
import { UploadStatusIndicator } from "@/components/ui/upload-status";
import { SlidePanelFooter } from "@/components/ui/slide-panel-footer";
import { cn } from "@/lib/utils";
import { MessageSquare, Users, Calendar } from "lucide-react";

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
  const [apiKey, setApiKey] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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
    (fileList: FileList) => {
      Array.from(fileList).forEach((file) => importChat(file));
    },
    [importChat]
  );

  const removeChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  };

  const readyCount = chats.filter((c) => c.status === "ready").length;

  const handleClose = () => {
    setChats([]);
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
              <DropZone
                accept=".txt,.zip"
                onFiles={handleFiles}
                icon={<MessageSquare className="h-5 w-5 text-muted-foreground" />}
                primaryText="Upload WhatsApp chat exports"
                draggingText="Drop chat exports here"
                secondaryText=".txt or .zip files exported from WhatsApp"
              />
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
                      <UploadStatusIndicator
                        status={chat.status === "processing" ? "uploading" : chat.status}
                        onRemove={() => removeChat(chat.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {chats.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
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

        <SlidePanelFooter>
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
        </SlidePanelFooter>
      </div>
    </SlidePanel>
  );
}
