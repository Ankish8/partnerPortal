import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  HelpCircle,
  Shield,
  BookOpen,
  ChevronRight,
  ChevronDown,
  X,
  Plus,
  Trash2,
  Play,
  Check,
  Users,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const meta: Meta = {
  title: "Guidance/Components",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Composite patterns used in the Configure > Intents guidance editor. Includes category headers with icons, collapsible guidance items, expanded editors with save/cancel actions, pill-style item rows, and action button groups.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

// ─── Category Icon ────────────────────────────────────────────────────────

export const CategoryIcon: Story = {
  name: "Category Icon",
  render: () => (
    <div className="flex gap-4 items-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700">
        <MessageSquare className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700">
        <HelpCircle className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700">
        <BookOpen className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700">
        <Shield className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
    </div>
  ),
};

// ─── Category Header ──────────────────────────────────────────────────────

export const CategoryHeader: Story = {
  name: "Category Header",
  render: () => (
    <div className="flex items-start gap-3 w-[600px]">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 shrink-0">
        <MessageSquare className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[15px] font-bold">Communication style</p>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className="text-[14px] text-muted-foreground mt-0.5">
          Create customized guidance on the vocabulary and terms your AI agent should use.
        </p>
      </div>
    </div>
  ),
};

// ─── Collapsed Guidance Item ──────────────────────────────────────────────

export const CollapsedItem: Story = {
  name: "Collapsed Guidance Item",
  render: () => (
    <div className="w-[700px] rounded-xl border border-border/60 overflow-hidden">
      <button className="w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors group cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[15px] font-bold">Shopping Assistant</span>
              <Badge variant="outline" className="text-[12px] font-normal">
                Not enabled
              </Badge>
              <Badge variant="outline" className="text-[12px] font-normal">
                Everyone on All channels
              </Badge>
            </div>
            <p className="text-[13px] text-muted-foreground mb-1.5">
              Used: <span className="font-semibold text-foreground">0</span> &bull; Resolved:{" "}
              <span className="font-semibold text-foreground">—</span> &bull; Escalated:{" "}
              <span className="font-semibold text-foreground">—</span>
            </p>
            <p className="text-[14px] text-muted-foreground line-clamp-2">
              You are a helpful and persuasive shopping assistant. Your goal is to guide customers toward making a purchase. ALWAYS: - Greet customers warmly and keep responses short and easy to follow.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-foreground transition-colors" />
        </div>
      </button>
    </div>
  ),
};

// ─── Expanded Guidance Item ───────────────────────────────────────────────

export const ExpandedItem: Story = {
  name: "Expanded Guidance Item",
  render: () => {
    const originalContent = `You are a helpful and persuasive shopping assistant. Your goal is to guide customers toward making a purchase. ALWAYS:\n- Greet customers warmly and keep responses short and easy to follow.\n- At the end of every direct answer, ask an exploratory follow-up question.\n- Ask clarifying questions to understand customer preferences and budget.`;
    const [content, setContent] = useState(originalContent);
    const hasChanges = content !== originalContent;
    return (
      <div className="w-[700px] rounded-xl border border-border/60 overflow-hidden">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-bold">Shopping Assistant</span>
              <Badge variant="outline" className="text-[12px] font-normal">
                Not enabled
              </Badge>
              <Badge variant="outline" className="text-[12px] font-normal">
                New
              </Badge>
            </div>
            <button className="p-1 rounded-md hover:bg-muted transition-colors shrink-0 cursor-pointer">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-[13px] text-muted-foreground mt-1">
            Used: <span className="font-semibold text-foreground">0</span> &bull; Resolved:{" "}
            <span className="font-semibold text-foreground">—</span> &bull; Escalated:{" "}
            <span className="font-semibold text-foreground">—</span>
          </p>
        </div>
        <div className="px-5 pb-4 border-t border-border/40 pt-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[160px] text-[14px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-full text-[13px] gap-1.5 pointer-events-none">
              <Users className="h-3.5 w-3.5" /> Everyone
            </Button>
            <Button variant="outline" size="sm" className="rounded-full text-[13px] gap-1.5 pointer-events-none">
              <Building2 className="h-3.5 w-3.5" /> All channels
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer">
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
            <Button size="sm" className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-[13px] h-8 px-3.5">
              <Play className="h-3 w-3 mr-1 fill-current" /> Enable
            </Button>
            <button
              disabled={!hasChanges}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] transition-colors",
                hasChanges
                  ? "bg-muted/70 text-foreground hover:bg-muted cursor-pointer"
                  : "text-muted-foreground/50 cursor-default"
              )}
            >
              Cancel
            </button>
            <button
              disabled={!hasChanges}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] transition-colors",
                hasChanges
                  ? "bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                  : "bg-muted/70 text-muted-foreground/50 cursor-default"
              )}
            >
              <Check className="h-3.5 w-3.5" /> Save
            </button>
          </div>
        </div>
      </div>
    );
  },
};

// ─── Pill Items ───────────────────────────────────────────────────────────

export const PillItems: Story = {
  name: "Pill Items Row",
  render: () => (
    <div className="flex items-center gap-2.5 flex-wrap w-[700px]">
      <button className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 text-[14px] text-foreground hover:bg-muted transition-colors cursor-pointer">
        <Plus className="h-4 w-4" /> New
      </button>
      <button className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-[14px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
        Clarify age for eligibility
      </button>
      <button className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-[14px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
        Clarify platform for troubleshooting
      </button>
      <button className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-[14px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
        Clarify brief messages
      </button>
    </div>
  ),
};

// ─── Action Buttons ───────────────────────────────────────────────────────

export const ActionButtonsDisabled: Story = {
  name: "Action Buttons (No Changes)",
  render: () => (
    <div className="flex items-center gap-3">
      <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer">
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
      <Button size="sm" className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-[13px] h-8 px-3.5">
        <Play className="h-3 w-3 mr-1 fill-current" /> Enable
      </Button>
      <button disabled className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] text-muted-foreground/50 cursor-default">
        Cancel
      </button>
      <button disabled className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 text-[14px] text-muted-foreground/50 cursor-default">
        <Check className="h-3.5 w-3.5" /> Save
      </button>
    </div>
  ),
};

export const ActionButtonsActive: Story = {
  name: "Action Buttons (Has Changes)",
  render: () => (
    <div className="flex items-center gap-3">
      <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer">
        <Trash2 className="h-[18px] w-[18px]" />
      </button>
      <Button size="sm" className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-[13px] h-8 px-3.5">
        <Play className="h-3 w-3 mr-1 fill-current" /> Enable
      </Button>
      <button className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 text-[14px] text-foreground hover:bg-muted transition-colors cursor-pointer">
        Cancel
      </button>
      <button className="inline-flex items-center gap-1 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 px-3 py-1.5 text-[14px] transition-colors cursor-pointer">
        <Check className="h-3.5 w-3.5" /> Save
      </button>
    </div>
  ),
};
