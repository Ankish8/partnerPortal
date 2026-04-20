"use client";

import { SlidePanel } from "@/components/ui/slide-panel";
import { SlidePanelFooter } from "@/components/ui/slide-panel-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Phone,
  MessageSquare,
  FileText,
  Pencil,
  Trash2,
  Play,
  X,
  Users,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface Intent {
  id: string;
  name: string;
  description: string;
  source: "call" | "whatsapp" | "manual";
  flowLinked: boolean;
  sampleQueries: string[];
  confidence: number;
}

const sourceConfig: Record<
  Intent["source"],
  { icon: typeof Phone; label: string }
> = {
  call: { icon: Phone, label: "Call" },
  whatsapp: { icon: MessageSquare, label: "WhatsApp" },
  manual: { icon: FileText, label: "Manual" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  intent: Intent | null;
}

export function IntentDetailPanel({ open, onClose, intent }: Props) {
  const [activeTab, setActiveTab] = useState<"content" | "testing">("content");

  if (!open || !intent) return null;

  const source = sourceConfig[intent.source];
  const SourceIcon = source.icon;

  const header = (
    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
          <Brain className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-semibold">{intent.name}</h2>
            <Badge
              variant="secondary"
              className="text-[11px] px-1.5 py-0 font-medium"
            >
              {intent.flowLinked ? "Enabled" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!intent.flowLinked && (
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Play className="h-3 w-3" />
            Enable
          </Button>
        )}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title={intent.name}
      customHeader={header}
      panelClassName="!w-[600px]"
    >
      {/* Tabs */}
      <div className="flex border-b border-border/60 px-6">
        {(["content", "testing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 text-[14px] font-medium transition-colors cursor-pointer capitalize",
              activeTab === tab
                ? "border-b-[2.5px] border-[#e87537] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "content" ? "Content" : "Testing"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "content" && (
          <div className="px-6 py-6 space-y-6">
            {/* Description */}
            <div>
              <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-2">
                Description
              </p>
              <p className="text-[14px] text-foreground/80 leading-relaxed">
                {intent.description}
              </p>
            </div>

            <div className="border-t" />

            {/* Guidance / Sample Queries */}
            <div>
              <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-3">
                Sample Queries
              </p>
              <div className="space-y-2">
                {intent.sampleQueries.map((q) => (
                  <div
                    key={q}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-[13px] text-foreground/80 leading-relaxed">
                      &quot;{q}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t" />

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-y-5 gap-x-4">
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
                  Status
                </p>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium",
                    intent.flowLinked
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {intent.flowLinked ? "Flow linked" : "No flow"}
                </span>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground mb-1.5">
                  Confidence
                </p>
                <p className="text-[13px] font-medium">{intent.confidence}%</p>
              </div>
            </div>

            <div className="border-t" />

            {/* Audience */}
            <div>
              <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider mb-3">
                Audience
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  Everyone
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  All channels
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "testing" && (
          <div className="px-6 py-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-medium mb-1">Test this intent</p>
              <p className="text-[13px] text-muted-foreground max-w-[280px]">
                Ask a question to see if your AI agent correctly identifies this
                intent.
              </p>
              <div className="mt-6 w-full max-w-sm">
                <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2.5">
                  <input
                    type="text"
                    className="flex-1 text-[14px] outline-none bg-transparent"
                    placeholder="Ask a question..."
                  />
                  <Button size="sm" variant="ghost" className="shrink-0">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <SlidePanelFooter
        leading={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        }
      >
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="rounded-lg cursor-pointer"
        >
          Cancel
        </Button>
        <Button size="sm" className="gap-1.5 rounded-lg cursor-pointer">
          <Pencil className="h-3.5 w-3.5" />
          Save
        </Button>
      </SlidePanelFooter>
    </SlidePanel>
  );
}
