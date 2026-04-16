"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AnimateHeight } from "@/components/ui/animate-height";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Shield,
  BookOpen,
  X,
  Plus,
  Trash2,
  Play,
  Check,
  Users,
  Building2,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Smile,
  Minus,
  Square,
  Briefcase,
  Laugh,
  Settings,
  RotateCcw,
  Bot,
  Paperclip,
  Image,
  Mic,
  Compass,
  MoreHorizontal,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuidanceItem {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  isNew?: boolean;
  audience: string;
  channels: string;
  stats: { used: number; resolved: number | null; escalated: number | null };
}

interface GuidanceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  /** "full" = each item renders as a full card; "pills" = compact pill buttons */
  displayMode: "full" | "pills";
  items: GuidanceItem[];
}

type ToneOption = "friendly" | "neutral" | "matter-of-fact" | "professional" | "humorous";
type LengthOption = "concise" | "standard" | "thorough";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const initialCategories: GuidanceCategory[] = [
  {
    id: "communication",
    title: "Communication style",
    description: "Create customized guidance on the vocabulary and terms your AI agent should use.",
    icon: MessageSquare,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
    displayMode: "full" as const,
    items: [
      {
        id: "comm-1",
        title: "Shopping Assistant",
        content: `You are a helpful and persuasive shopping assistant. Your goal is to guide customers toward making a purchase. ALWAYS:
- Greet customers warmly and keep responses short and easy to follow.
- At the end of every direct answer, ask an exploratory follow-up question.
- Ask clarifying questions to understand customer preferences and budget.
- Recommend specific products that match their needs, highlighting benefits and value.
- When appropriate, suggest complementary items to increase basket size.
- Use positive and reassuring language to build confidence, but DO NOT over-reassure.
- Ask no more than 2 questions at once, so it doesn't feel like an interrogation.`,
        enabled: false,
        isNew: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 0, resolved: null, escalated: null },
      },
    ],
  },
  {
    id: "context",
    title: "Context and clarification",
    description: "Create customized guidance on the follow-up questions your AI agent should ask.",
    icon: HelpCircle,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
    displayMode: "pills" as const,
    items: [
      {
        id: "ctx-1",
        title: "Clarify age for eligibility",
        content: "When a customer asks about eligibility for a service, always ask their age first before providing information about age-restricted services.",
        enabled: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 12, resolved: 8, escalated: 2 },
      },
      {
        id: "ctx-2",
        title: "Clarify platform for troubleshooting",
        content: "When a customer reports a technical issue, ask which platform they are using (iOS, Android, Web) before suggesting troubleshooting steps.",
        enabled: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 34, resolved: 28, escalated: 3 },
      },
      {
        id: "ctx-3",
        title: "Clarify brief messages",
        content: "When a customer sends a very short or ambiguous message, ask a clarifying question instead of guessing the intent. For example, if they say 'help', ask 'What do you need help with today?'",
        enabled: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 56, resolved: 45, escalated: 5 },
      },
    ],
  },
  {
    id: "content",
    title: "Content and sources",
    description: "Create customized guidance on when and how your AI agent should use specific articles or sources in responses.",
    icon: BookOpen,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
    displayMode: "pills" as const,
    items: [
      {
        id: "src-1",
        title: "Troubleshoot connection issues with sni...",
        content: "When customers report connection issues, always reference the 'Connection Troubleshooting Guide' article and walk them through the SNI configuration steps before escalating.",
        enabled: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 23, resolved: 18, escalated: 3 },
      },
      {
        id: "src-2",
        title: "Guide 2FA setup with help con...",
        content: "When customers ask about setting up two-factor authentication, direct them to the help center article on 2FA setup and offer to walk them through each step.",
        enabled: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 15, resolved: 12, escalated: 1 },
      },
      {
        id: "src-3",
        title: "Link troubleshooting guide for payment fail...",
        content: "When customers experience payment failures, always link to the payment troubleshooting guide and ask for the error code they received.",
        enabled: true,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 41, resolved: 35, escalated: 4 },
      },
    ],
  },
  {
    id: "spam",
    title: "Spam",
    description: "Create customized guidance on how your AI agent should identify and handle potential spam messages.",
    icon: Shield,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
    displayMode: "pills" as const,
    items: [],
  },
];

// ─── Basics Card ─────────────────────────────────────────────────────────────

const toneOptions: { value: ToneOption; label: string; icon: React.ElementType }[] = [
  { value: "friendly", label: "Friendly", icon: Smile },
  { value: "neutral", label: "Neutral", icon: Minus },
  { value: "matter-of-fact", label: "Matter-of-fact", icon: Square },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "humorous", label: "Humorous", icon: Laugh },
];

const lengthOptions: { value: LengthOption; label: string; icon: React.ElementType }[] = [
  { value: "concise", label: "Concise", icon: AlignLeft },
  { value: "standard", label: "Standard", icon: AlignCenter },
  { value: "thorough", label: "Thorough", icon: AlignJustify },
];

function BasicsCard() {
  const [expanded, setExpanded] = useState(false);
  const [tone, setTone] = useState<ToneOption>("friendly");
  const [length, setLength] = useState<LengthOption>("standard");
  const [savedTone, setSavedTone] = useState<ToneOption>("friendly");
  const [savedLength, setSavedLength] = useState<LengthOption>("standard");

  const toneLabel = toneOptions.find((t) => t.value === savedTone)?.label || "";
  const lengthLabel = lengthOptions.find((l) => l.value === savedLength)?.label || "";

  const handleSave = () => {
    setSavedTone(tone);
    setSavedLength(length);
    setExpanded(false);
  };

  const handleCancel = () => {
    setTone(savedTone);
    setLength(savedLength);
    setExpanded(false);
  };

  const hasChanges = tone !== savedTone || length !== savedLength;

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-[14px] font-semibold">Basics</span>
          {!expanded && (
            <span className="text-[14px] text-muted-foreground">
              {toneLabel} tone, {lengthLabel} length
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimateHeight expanded={expanded}>
        <div className="px-5 pb-5 space-y-5 border-t border-border/60">
          <div className="pt-4">
            <p className="text-[14px] font-semibold mb-3">AI Agent&apos;s tone of voice</p>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTone(opt.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] transition-colors cursor-pointer",
                      tone === opt.value
                        ? "border-[#e87537] bg-[#e87537]/5 text-foreground font-medium"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold mb-3">AI Agent&apos;s answer length</p>
            <div className="flex flex-wrap gap-2">
              {lengthOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setLength(opt.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] transition-colors cursor-pointer",
                      length === opt.value
                        ? "border-[#e87537] bg-[#e87537]/5 text-foreground font-medium"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <p className="text-[13px] text-muted-foreground">
              These settings apply to WhatsApp and Chat channels
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-[13px]" onClick={handleCancel} disabled={!hasChanges}>
                Cancel
              </Button>
              <Button
                variant={hasChanges ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-[13px]",
                  hasChanges && "bg-emerald-700 text-white hover:bg-emerald-800"
                )}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
}

// ─── Guidance Item — Expanded Editor ─────────────────────────────────────────

function GuidanceItemExpanded({
  item,
  onSave,
  onDelete,
  onClose,
}: {
  item: GuidanceItem;
  onSave: (updated: GuidanceItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [editContent, setEditContent] = useState(item.content);
  const [editEnabled, setEditEnabled] = useState(item.enabled);

  const hasChanges = editContent !== item.content || editEnabled !== item.enabled;

  const handleSave = () => {
    onSave({ ...item, content: editContent, enabled: editEnabled });
    onClose();
  };

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-bold">{item.title}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-[12px] font-normal",
                editEnabled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : ""
              )}
            >
              {editEnabled ? "Enabled" : "Not enabled"}
            </Badge>
            {item.isNew && (
              <Badge variant="outline" className="text-[12px] font-normal">
                New
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-[13px] text-muted-foreground mt-1">
          Used: <span className="font-semibold text-foreground">{item.stats.used}</span> &bull; Resolved:{" "}
          <span className="font-semibold text-foreground">{item.stats.resolved ?? "—"}</span> &bull; Escalated:{" "}
          <span className="font-semibold text-foreground">{item.stats.escalated ?? "—"}</span>
        </p>
      </div>

      {/* Content */}
      <div className="px-5 pb-4 border-t border-border/40 pt-4">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[160px] text-[14px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full text-[13px] gap-1.5 pointer-events-none">
            <Users className="h-3.5 w-3.5" />
            {item.audience}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full text-[13px] gap-1.5 pointer-events-none">
            <Building2 className="h-3.5 w-3.5" />
            {item.channels}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
          >
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
          <Button
            size="sm"
            onClick={() => setEditEnabled(!editEnabled)}
            className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 text-[13px] h-8 px-3.5"
          >
            <Play className="h-3 w-3 mr-1 fill-current" />
            {editEnabled ? "Disable" : "Enable"}
          </Button>
          <button
            onClick={onClose}
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
            onClick={handleSave}
            disabled={!hasChanges}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[14px] transition-colors",
              hasChanges
                ? "bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                : "bg-muted/70 text-muted-foreground/50 cursor-default"
            )}
          >
            <Check className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Guidance Item — Collapsed Row ───────────────────────────────────────────

function GuidanceItemRow({
  item,
  onExpand,
  isLast,
}: {
  item: GuidanceItem;
  onExpand: () => void;
  isLast: boolean;
}) {
  return (
    <button
      onClick={onExpand}
      className={cn(
        "w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors group cursor-pointer",
        !isLast && "border-b border-border/60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[15px] font-bold">{item.title}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-[12px] font-normal",
                item.enabled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : ""
              )}
            >
              {item.enabled ? "Enabled" : "Not enabled"}
            </Badge>
            <Badge variant="outline" className="text-[12px] font-normal">
              {item.audience} on {item.channels}
            </Badge>
          </div>
          <p className="text-[13px] text-muted-foreground mb-1.5">
            Used: <span className="font-semibold text-foreground">{item.stats.used}</span> &bull; Resolved:{" "}
            <span className="font-semibold text-foreground">{item.stats.resolved ?? "—"}</span> &bull; Escalated:{" "}
            <span className="font-semibold text-foreground">{item.stats.escalated ?? "—"}</span>
          </p>
          <p className="text-[14px] text-muted-foreground line-clamp-2">{item.content}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-foreground transition-colors" />
      </div>
    </button>
  );
}

// ─── Guidance Category Section ───────────────────────────────────────────────

function GuidanceCategorySection({
  category,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
}: {
  category: GuidanceCategory;
  onUpdateItem: (categoryId: string, item: GuidanceItem) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onAddItem: (categoryId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const Icon = category.icon;

  return (
    <div>
      {/* Category header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-start gap-3 w-full text-left group mb-3 cursor-pointer"
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", category.iconBg)}>
          <Icon className={cn("h-[18px] w-[18px]", category.iconColor)} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[15px] font-bold">{category.title}</p>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                collapsed && "-rotate-90"
              )}
            />
          </div>
          <p className="text-[14px] text-muted-foreground mt-0.5">{category.description}</p>
        </div>
      </button>

      {/* Items */}
      <AnimateHeight expanded={!collapsed}>
        <div className="ml-12">
          {/* Full card items (Communication style) */}
          {category.displayMode === "full" && category.items.length > 0 && (
            <div className="space-y-2 mb-2">
              {category.items.map((item) =>
                expandedItemId === item.id ? (
                  <GuidanceItemExpanded
                    key={item.id}
                    item={item}
                    onSave={(updated) => onUpdateItem(category.id, updated)}
                    onDelete={(id) => {
                      onDeleteItem(category.id, id);
                      setExpandedItemId(null);
                    }}
                    onClose={() => setExpandedItemId(null)}
                  />
                ) : (
                  <div key={item.id} className="rounded-xl border border-border/60 overflow-hidden">
                    <GuidanceItemRow
                      item={item}
                      onExpand={() => setExpandedItemId(item.id)}
                      isLast={true}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* Pill-style items (Context, Content, Spam) */}
          {category.displayMode === "pills" && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* + New button first */}
              <button
                onClick={() => onAddItem(category.id)}
                className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 text-[14px] text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                  className="inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-[14px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer max-w-[280px] truncate"
                >
                  {item.title}
                </button>
              ))}
              {category.items.length > 3 && (
                <button className="inline-flex items-center justify-center rounded-full border border-border px-2.5 py-1.5 text-[14px] text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Expanded pill item */}
          {category.displayMode === "pills" && expandedItemId && category.items.find((i) => i.id === expandedItemId) && (
            <div className="mt-3">
              <GuidanceItemExpanded
                item={category.items.find((i) => i.id === expandedItemId)!}
                onSave={(updated) => onUpdateItem(category.id, updated)}
                onDelete={(id) => {
                  onDeleteItem(category.id, id);
                  setExpandedItemId(null);
                }}
                onClose={() => setExpandedItemId(null)}
              />
            </div>
          )}

          {/* + New button for full-display categories */}
          {category.displayMode === "full" && (
            <button
              onClick={() => onAddItem(category.id)}
              className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-3 py-1.5 text-[14px] text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
          )}
        </div>
      </AnimateHeight>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GuidancePage() {
  const [categories, setCategories] = useState<GuidanceCategory[]>(initialCategories);
  const [search, setSearch] = useState("");
  const [previewTab, setPreviewTab] = useState<"customer" | "event">("customer");

  const handleUpdateItem = useCallback(
    (categoryId: string, updatedItem: GuidanceItem) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === updatedItem.id ? updatedItem : item
                ),
              }
            : cat
        )
      );
    },
    []
  );

  const handleDeleteItem = useCallback(
    (categoryId: string, itemId: string) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
            : cat
        )
      );
    },
    []
  );

  const handleAddItem = useCallback((categoryId: string) => {
    const newItem: GuidanceItem = {
      id: `new-${Date.now()}`,
      title: "New guidance",
      content: "",
      enabled: false,
      isNew: true,
      audience: "Everyone",
      channels: "All channels",
      stats: { used: 0, resolved: null, escalated: null },
    };
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat
      )
    );
  }, []);

  // Filter categories and items based on search
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: search
        ? cat.items.filter(
            (item) =>
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              item.content.toLowerCase().includes(search.toLowerCase())
          )
        : cat.items,
    }))
    .filter((cat) => !search || cat.items.length > 0);

  return (
    <>
      {/* Main content */}
      <div className="flex-1 overflow-auto rounded-xl bg-white min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Compass className="h-[18px] w-[18px] text-muted-foreground" />
            <h1 className="text-[17px] font-semibold">Guidance</h1>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Basics */}
          <div className="mb-7">
            <BasicsCard />
          </div>

          {/* Search & Filters */}
          <div className="mb-7 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search guidance by title or content"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-[14px]"
              />
            </div>
            <Button variant="outline" size="sm" className="h-10 gap-1.5 px-4 text-[13px]">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Sections */}
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <GuidanceCategorySection
                key={category.id}
                category={category}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onAddItem={handleAddItem}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview panel — same as Content page */}
      <div className="flex w-[380px] shrink-0 flex-col rounded-xl bg-white">
        {/* Preview header */}
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-[20px] font-semibold tracking-tight">Preview</h2>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <Settings className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <RotateCcw className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <X className="h-[18px] w-[18px] text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Testing as */}
        <div className="flex items-center gap-3 border-t border-border/40 px-6 py-3.5">
          <span className="text-[13px] text-muted-foreground">Testing as</span>
          <Button variant="outline" size="sm" className="h-8 text-[13px] gap-1.5 rounded-lg font-medium">
            <Bot className="h-3.5 w-3.5" />
            Preview user
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-border/40 px-2">
          <button
            onClick={() => setPreviewTab("customer")}
            className={`px-4 py-3.5 text-[14px] font-medium transition-colors cursor-pointer ${
              previewTab === "customer"
                ? "border-b-[2.5px] border-[#e87537] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Customer view
          </button>
          <button
            onClick={() => setPreviewTab("event")}
            className={`px-4 py-3.5 text-[14px] font-medium transition-colors cursor-pointer ${
              previewTab === "event"
                ? "border-b-[2.5px] border-[#e87537] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Event log
          </button>
        </div>

        {/* Preview content */}
        <div className="flex flex-1 flex-col items-center justify-center px-10 text-center border-t border-border/40">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
            <Bot className="h-7 w-7 text-muted-foreground/70" />
          </div>
          <p className="text-[14px] leading-[1.6] text-muted-foreground">
            Ask your agent a question your customers might ask, to preview its response.
          </p>
        </div>

        {/* Input */}
        <div className="border-t border-border/40 px-5 py-5">
          <div className="rounded-xl border border-border/60 px-4 py-3.5">
            <Input
              placeholder="Ask a question..."
              className="border-0 p-0 h-auto text-[14px] shadow-none focus-visible:ring-0"
            />
            <div className="mt-3 flex items-center gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <Paperclip className="h-[18px] w-[18px] text-muted-foreground/60" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <Smile className="h-[18px] w-[18px] text-muted-foreground/60" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <Image className="h-[18px] w-[18px] text-muted-foreground/60" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <Mic className="h-[18px] w-[18px] text-muted-foreground/60" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
