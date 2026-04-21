"use client";

import { SlidePanel } from "@/components/ui/slide-panel";
import { SlidePanelFooter } from "@/components/ui/slide-panel-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  FileText,
  Phone,
  MessageSquare,
  Pencil,
  XCircle,
  CheckCircle2,
  X,
} from "lucide-react";

export interface KnowledgeEntry {
  id: string;
  shortId: string;
  question: string;
  answer: string;
  tag: string;
  version: number;
  status: "active" | "inactive";
  confidence: number;
  sourceType: "website" | "document" | "call" | "whatsapp";
  sourceId: string;
  intent: string;
  scenarioType: string;
  activationPolicy: string;
  createdAt: string;
  updatedAt: string;
}

const sourceConfig: Record<
  KnowledgeEntry["sourceType"],
  { icon: typeof Globe; label: string }
> = {
  website: { icon: Globe, label: "Website" },
  document: { icon: FileText, label: "Document" },
  call: { icon: Phone, label: "Call" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp Chat" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  entry: KnowledgeEntry | null;
}

export function KnowledgeDetailPanel({ open, onClose, entry }: Props) {
  if (!open || !entry) return null;

  const source = sourceConfig[entry.sourceType];
  const SourceIcon = source.icon;

  const header = (
    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
      <h2 className="text-[15px] font-semibold">Knowledge Base Details</h2>
      <button
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Knowledge Base Details"
      customHeader={header}
      panelClassName="!w-[560px]"
    >
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Question */}
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Question
            </p>
            <p className="text-[16px] font-medium leading-relaxed">
              {entry.question}
            </p>
          </div>

          {/* Answer */}
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">
              Answer
            </p>
            <p className="text-[14px] text-foreground/80 leading-[1.7]">
              {entry.answer}
            </p>
          </div>

          <div className="border-t" />

          {/* Metadata grid — cleaned up */}
          <div className="grid grid-cols-3 gap-y-5 gap-x-4">
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">Tag</p>
              <span className="inline-flex rounded-full border px-2 py-0.5 text-[12px] font-medium">
                {entry.tag}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Status
              </p>
              <Badge variant={entry.status === "active" ? "success" : "outline"}>
                {entry.status}
              </Badge>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Confidence
              </p>
              <p className="text-[13px]">{entry.confidence}%</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Source
              </p>
              <span className="inline-flex items-center gap-1.5 text-[13px]">
                <SourceIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {source.label}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Created
              </p>
              <p className="text-[13px]">{entry.createdAt}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Updated
              </p>
              <p className="text-[13px]">{entry.updatedAt}</p>
            </div>
          </div>

          <div className="border-t" />

          {/* Intent */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-1.5">Intent</p>
            <p className="text-[14px] leading-relaxed">{entry.intent}</p>
          </div>
        </div>
      </div>

      <SlidePanelFooter>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-lg cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        {entry.status === "active" ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
          >
            <XCircle className="h-3.5 w-3.5" />
            Deactivate
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Activate
          </Button>
        )}
      </SlidePanelFooter>
    </SlidePanel>
  );
}
