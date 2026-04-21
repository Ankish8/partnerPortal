"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import {
  Globe,
  FileText,
  Phone,
  MessageSquare,
  Database,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  MoreHorizontal,
  Circle,
  Settings,
  Check,
  RefreshCw,
  Trash2,
  History,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { WebsiteSyncPanel } from "@/components/train/website-sync-panel";
import { DocumentsPanel } from "@/components/train/documents-panel";
import { CallRecordingsPanel } from "@/components/train/call-recordings-panel";
import { WhatsAppPanel } from "@/components/train/whatsapp-panel";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import { cn } from "@/lib/utils";

type PanelType = "website" | "documents" | "calls" | "whatsapp";

const addSourceTypes = [
  { label: "Website", icon: Globe, panel: "website" as const },
  { label: "Documents", icon: FileText, panel: "documents" as const },
  { label: "Calls", icon: Phone, panel: "calls" as const },
  { label: "WhatsApp Chats", icon: MessageSquare, panel: "whatsapp" as const },
];

interface ContentSourceRow {
  id: string;
  title: string;
  icon: typeof Globe;
  href: string;
  panel: PanelType;
  status: "live" | "inactive";
  statusText: string;
  aiAgent: string;
  aiAgentActive: boolean;
  isWebsiteSource?: boolean;
  faviconUrl?: string;
}

export default function TrainPage() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<PanelType | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);

  // Convex queries
  const websiteSourcesRaw = useQuery(api.websiteSources.list);
  const documentsRaw = useQuery(api.documents.list);
  const recordingsRaw = useQuery(api.callRecordings.list);
  const chatsRaw = useQuery(api.whatsappChats.list);
  const websiteSources = useMemo(() => websiteSourcesRaw ?? [], [websiteSourcesRaw]);
  const documents = useMemo(() => documentsRaw ?? [], [documentsRaw]);
  const recordings = useMemo(() => recordingsRaw ?? [], [recordingsRaw]);
  const chats = useMemo(() => chatsRaw ?? [], [chatsRaw]);

  // Convex mutations
  const removeWebsiteSource = useMutation(api.websiteSources.remove);

  const websiteSource = websiteSources[0];

  const contentSources = useMemo<ContentSourceRow[]>(() => {
    const livePages = websiteSource?.livePages ?? 0;
    const totalPages = websiteSource?.totalPages ?? 0;
    const readyDocs = documents.filter((d) => d.status === "ready").length;
    const readyRecs = recordings.filter((r) => r.status === "ready").length;
    const readyChats = chats.filter((c) => c.status === "ready").length;

    const sources: ContentSourceRow[] = [];

    if (websiteSource) {
      sources.push({
        id: websiteSource._id,
        title: websiteSource.name,
        icon: Globe,
        href: "/train/websites",
        panel: "website",
        status: livePages > 0 ? "live" : "inactive",
        statusText: `${livePages}/${totalPages} Live`,
        aiAgent: `${livePages}`,
        aiAgentActive: livePages > 0,
        isWebsiteSource: true,
        faviconUrl: `https://www.google.com/s2/favicons?domain=${new URL(websiteSource.url).hostname}&sz=32`,
      });
    }

    if (documents.length > 0) {
      sources.push({
        id: "base-documents",
        title: "Uploaded Documents",
        icon: FileText,
        href: "/train/documents",
        panel: "documents",
        status: readyDocs > 0 ? "live" : "inactive",
        statusText: readyDocs > 0 ? `${readyDocs} Live` : "0 Live",
        aiAgent: readyDocs > 0 ? `${readyDocs}` : "—",
        aiAgentActive: readyDocs > 0,
      });
    }

    if (recordings.length > 0) {
      sources.push({
        id: "base-calls",
        title: "Calls",
        icon: Phone,
        href: "/train/calls",
        panel: "calls",
        status: readyRecs > 0 ? "live" : "inactive",
        statusText: `${readyRecs} Live`,
        aiAgent: readyRecs > 0 ? `${readyRecs}` : "—",
        aiAgentActive: readyRecs > 0,
      });
    }

    if (chats.length > 0) {
      sources.push({
        id: "base-whatsapp",
        title: "WhatsApp Conversations",
        icon: MessageSquare,
        href: "/train/whatsapp",
        panel: "whatsapp",
        status: readyChats > 0 ? "live" : "inactive",
        statusText: `${readyChats} Live`,
        aiAgent: readyChats > 0 ? `${readyChats}` : "—",
        aiAgentActive: readyChats > 0,
      });
    }

    return sources;
  }, [websiteSource, documents, recordings, chats]);

  const openPanel = (panel: PanelType) => {
    setActivePanel(panel);
  };


  return (
    <>
      {/* Main content panel */}
      <div className="flex-1 overflow-auto rounded-xl bg-white min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Database className="h-[18px] w-[18px] text-muted-foreground" />
            <h1 className="text-[17px] font-semibold">Knowledge Sources</h1>
          </div>
          {!previewVisible && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-[13px]"
              onClick={() => setPreviewVisible(true)}
            >
              <Eye className="h-3.5 w-3.5" />
              Open preview
            </Button>
          )}
        </div>

        <div className="px-6 py-6">
          {/* Search & Filters */}
          <div className="mb-7 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 h-10 text-[14px]" />
            </div>
            <Button variant="outline" size="sm" className="h-10 gap-1.5 px-4 text-[13px]">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Add content */}
          <div className="mb-8">
            <p className="mb-3.5 text-[14px] font-semibold">Add content</p>
            <div className="grid grid-cols-4 gap-3">
              {addSourceTypes.map((source) => (
                <div key={source.label} onClick={() => openPanel(source.panel)}>
                  <Card className="h-full rounded-xl transition-colors hover:bg-muted/40 cursor-pointer border-border/60">
                    <CardContent className="px-5 py-5">
                      <source.icon className="mb-4 h-[22px] w-[22px] text-foreground/70" />
                      <p className="text-[14px] font-medium">{source.label}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Content sources table */}
          <div>
            <p className="mb-3.5 text-[14px] font-semibold">Content sources</p>
            {contentSources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 py-14 px-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
                  <Database className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <p className="text-[15px] font-semibold text-foreground/80">No content sources yet</p>
                <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                  Add your first content source above to start training your AI agent. Import websites, documents, call recordings, or WhatsApp chats.
                </p>
              </div>
            ) : (
            <div className="rounded-xl border border-border/60">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_180px_120px_48px] items-center gap-4 border-b border-border/60 px-5 py-3">
                <button className="group flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-[#e87537] transition-colors cursor-pointer">
                  Title
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <span className="text-[13px] font-medium text-muted-foreground">Status</span>
                <span className="text-[13px] font-medium text-muted-foreground">AI Agent</span>
                <span />
              </div>

              {/* Table rows */}
              {contentSources.map((source) => (
                <div
                  key={source.id}
                  className="group grid grid-cols-[1fr_180px_120px_48px] items-center gap-4 border-b last:border-b-0 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => router.push(source.href)}
                >
                  <div className="flex items-center gap-3">
                    {source.faviconUrl ? (
                      <Image
                        src={source.faviconUrl}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                        className="h-[18px] w-[18px] shrink-0 rounded-sm"
                      />
                    ) : (
                      <source.icon className="h-[18px] w-[18px] text-muted-foreground shrink-0" />
                    )}
                    <span className="text-[14px] group-hover:text-[#e87537] transition-colors">
                      {source.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {source.status === "live" ? (
                      <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                    ) : (
                      <Circle className="h-2.5 w-2.5 fill-gray-300 text-gray-300" />
                    )}
                    <span className="text-[14px] text-muted-foreground">{source.statusText}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {source.aiAgentActive && (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                    <span className="text-[14px] text-muted-foreground">{source.aiAgent}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<button type="button" />}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-[18px] w-[18px] text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4} className="w-52">
                      {source.isWebsiteSource && websiteSource && (
                        <>
                          <DropdownMenuItem
                            className="gap-2 px-3 py-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePanel("website");
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                            <div>
                              <span className="text-[13px]">Re-sync</span>
                              <p className="text-[11px] text-muted-foreground">
                                Last synced {new Date(websiteSource.syncedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 px-3 py-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push("/train/websites");
                            }}
                          >
                            <Settings className="h-4 w-4" />
                            <span className="text-[13px]">Open settings</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 px-3 py-2 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <History className="h-4 w-4" />
                            <span className="text-[13px]">View sync history</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2 px-3 py-2 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-[13px]">Remove this source</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      {(!source.isWebsiteSource || !websiteSource) && (
                        <DropdownMenuItem
                          className="gap-2 px-3 py-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPanel(source.panel);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          <span className="text-[13px]">Configure</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 overflow-hidden rounded-xl transition-all duration-300 ease-out",
          previewVisible ? "w-[400px]" : "w-0",
        )}
      >
        {previewVisible && (
          <GuidancePreviewPanel onClose={() => setPreviewVisible(false)} />
        )}
      </div>

      {/* Remove confirmation dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogPopup>
          <div className="flex items-start justify-between">
            <AlertDialogTitle>Remove this source?</AlertDialogTitle>
            <AlertDialogClose
              render={<button type="button" />}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </AlertDialogClose>
          </div>
          <AlertDialogDescription>
            This will remove the source and all its content—including synced pages—from your workspace. This action can&apos;t be undone and may take a few moments.
          </AlertDialogDescription>
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <AlertDialogClose
              render={<Button variant="outline" size="sm" />}
              className="h-9 px-4 text-[13px] font-medium"
            >
              Cancel
            </AlertDialogClose>
            <Button
              size="sm"
              className="h-9 px-4 text-[13px] font-medium bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (websiteSource) {
                  removeWebsiteSource({ id: websiteSource._id });
                }
                setRemoveDialogOpen(false);
              }}
            >
              Remove
            </Button>
          </div>
        </AlertDialogPopup>
      </AlertDialog>

      {/* Slide panels */}
      <WebsiteSyncPanel
        open={activePanel === "website"}
        onClose={() => setActivePanel(null)}
        existingSyncUrls={websiteSources.map((s) => s.url)}
        onSeeExistingSync={() => {
          setActivePanel(null);
          router.push("/train/websites");
        }}
      />
      <DocumentsPanel
        open={activePanel === "documents"}
        onClose={() => setActivePanel(null)}
      />
      <CallRecordingsPanel
        open={activePanel === "calls"}
        onClose={() => setActivePanel(null)}
      />
      <WhatsAppPanel
        open={activePanel === "whatsapp"}
        onClose={() => setActivePanel(null)}
      />
    </>
  );
}
