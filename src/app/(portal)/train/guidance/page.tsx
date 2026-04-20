"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { AnimateHeight } from "@/components/ui/animate-height";
import { SlidePanel } from "@/components/ui/slide-panel";
import { SlidePanelEditorHeader } from "@/components/ui/slide-panel-editor-header";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import { TemplatesModal, COMMUNICATION_STYLE_TEMPLATES } from "@/components/train/templates-modal";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  Shield,
  BookOpen,
  Plus,
  Trash2,
  Check,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Smile,
  Minus,
  Square,
  Briefcase,
  Laugh,
  Compass,
  MoreHorizontal,
  Sparkles,
  Code,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuidanceItem {
  id: string;
  _id?: Id<"guidanceItems">;
  title: string;
  content: string;
  enabled: boolean;
  isNew?: boolean;
  audience: string;
  channels: string;
  categoryId?: string;
  stats: { used: number; resolved: number | null; escalated: number | null };
}

interface CategoryDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface GuidanceCategory extends CategoryDef {
  items: GuidanceItem[];
}

type ToneOption = "friendly" | "neutral" | "matter-of-fact" | "professional" | "humorous";
type LengthOption = "concise" | "standard" | "thorough";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const CATEGORIES: CategoryDef[] = [
  {
    id: "communication",
    title: "Communication style",
    description: "Create customized guidance on the vocabulary and terms your AI agent should use.",
    icon: MessageSquare,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
  },
  {
    id: "context",
    title: "Context and clarification",
    description: "Create customized guidance on the follow-up questions your AI agent should ask.",
    icon: HelpCircle,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
  },
  {
    id: "content",
    title: "Content and sources",
    description: "Create customized guidance on when and how your AI agent should use specific articles or sources in responses.",
    icon: BookOpen,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
  },
  {
    id: "spam",
    title: "Spam",
    description: "Create customized guidance on how your AI agent should identify and handle potential spam messages.",
    icon: Shield,
    iconBg: "bg-gray-700",
    iconColor: "text-white",
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

function BasicsCard({
  savedTone,
  savedLength,
  onSave,
}: {
  savedTone: ToneOption;
  savedLength: LengthOption;
  onSave: (tone: ToneOption, length: LengthOption) => void | Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tone, setTone] = useState<ToneOption>(savedTone);
  const [length, setLength] = useState<LengthOption>(savedLength);
  const toast = useToast();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing server-saved values into local draft state
    setTone(savedTone);
    setLength(savedLength);
  }, [savedTone, savedLength]);

  const toneLabel = toneOptions.find((t) => t.value === savedTone)?.label || "";
  const lengthLabel = lengthOptions.find((l) => l.value === savedLength)?.label || "";

  const handleSave = () => {
    onSave(tone, length);
    setExpanded(false);
    toast.add({
      title: "Basics saved",
      description: "Tone and answer length updated.",
      data: { variant: "success" },
    });
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
              <Button variant="secondary" size="sm" className="rounded-full text-[13px]" onClick={handleCancel} disabled={!hasChanges}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-full text-[13px]"
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

// ─── Guidance Item — Table Row ──────────────────────────────────────────────

function GuidanceItemTableRow({
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
        "w-full text-left grid grid-cols-[1fr_80px_60px_80px_80px] items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group cursor-pointer",
        !isLast && "border-b border-border/40"
      )}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-medium truncate">{item.title}</p>
        <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">{item.content}</p>
      </div>
      <div>
        <Badge
          variant="outline"
          className={cn(
            "text-[12px] font-normal",
            item.enabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : ""
          )}
        >
          {item.enabled ? "Live" : "Draft"}
        </Badge>
      </div>
      <span className="text-[14px] text-muted-foreground">{item.stats.used}</span>
      <span className="text-[14px] text-muted-foreground">{item.stats.resolved ?? "--"}</span>
      <span className="text-[14px] text-muted-foreground">{item.stats.escalated ?? "--"}</span>
    </button>
  );
}

// ─── Guidance Category Section ───────────────────────────────────────────────

function GuidanceCategorySection({
  category,
  onSelectItem,
  onAddItem,
}: {
  category: GuidanceCategory;
  onSelectItem: (categoryId: string, item: GuidanceItem) => void;
  onAddItem: (categoryId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = category.icon;

  return (
    <div>
      {/* Category header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-3 w-full text-left group mb-3 cursor-pointer"
      >
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-full shrink-0", category.iconBg)}>
          <Icon className={cn("h-[18px] w-[18px]", category.iconColor)} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold">{category.title}</p>
          <p className="text-[14px] text-muted-foreground mt-0.5">{category.description}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            collapsed && "-rotate-90"
          )}
        />
      </button>

      {/* Items */}
      <AnimateHeight expanded={!collapsed}>
        <div>
          {category.items.length > 0 ? (
            <div className="rounded-lg border border-border/60 overflow-hidden mb-2">
              <div className="grid grid-cols-[1fr_80px_60px_80px_80px] items-center gap-4 px-5 py-2.5 border-b border-border/60">
                <span className="text-[13px] font-medium text-muted-foreground">Name</span>
                <span className="text-[13px] font-medium text-muted-foreground">Status</span>
                <span className="text-[13px] font-medium text-muted-foreground">Used</span>
                <span className="text-[13px] font-medium text-muted-foreground">Resolved</span>
                <span className="text-[13px] font-medium text-muted-foreground">Routed</span>
              </div>
              {category.items.map((item, i) => (
                <GuidanceItemTableRow
                  key={item.id}
                  item={item}
                  onExpand={() => onSelectItem(category.id, item)}
                  isLast={i === category.items.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 py-6 px-5 text-center mb-2">
              <p className="text-[13px] text-muted-foreground">
                No guidelines yet. Click New to create one.
              </p>
            </div>
          )}

          <Button
            variant="secondary"
            className="rounded-full mt-2"
            onClick={() => onAddItem(category.id)}
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </AnimateHeight>
    </div>
  );
}

// ─── Guidance Detail Panel (SlidePanel from right) ──────────────────────────

function GuidanceDetailPanel({
  open,
  item,
  onClose,
  onSave,
  onDelete,
  personality,
}: {
  open: boolean;
  item: GuidanceItem | null;
  onClose: () => void;
  onSave: (updated: GuidanceItem) => void;
  onDelete: (id: string) => void;
  personality?: { tone?: string; length?: string };
}) {
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editEnabled, setEditEnabled] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- load selected item into editor draft state
      setEditTitle(item.title);
      setEditContent(item.content);
      setEditEnabled(item.enabled);
      setPreviewVisible(true);
    }
  }, [item]);

  if (!item) return null;

  const titleEmpty = !editTitle.trim();
  const contentEmpty = !editContent.trim();
  const hasChanges =
    editTitle !== item.title ||
    editContent !== item.content ||
    editEnabled !== item.enabled;

  const canSave = hasChanges && !titleEmpty && !contentEmpty;
  const canEnable = !contentEmpty && !titleEmpty;

  const emptyReason = titleEmpty
    ? "Guidance title can't be empty"
    : contentEmpty
    ? "Guidance can't be empty"
    : null;

  const saveDisabledReason = emptyReason ?? (!hasChanges ? "No changes to save" : null);

  const handleSave = () => {
    if (!canSave) return;
    onSave({ ...item, title: editTitle, content: editContent, enabled: editEnabled });
  };

  const handleEnable = () => {
    if (!canEnable) return;
    onSave({ ...item, title: editTitle, content: editContent, enabled: !editEnabled });
  };

  const requestClose = () => {
    if (hasChanges) {
      setConfirmDiscardOpen(true);
    } else {
      onClose();
    }
  };

  return (
    <>
    <SlidePanel
      open={open}
      onClose={requestClose}
      title={item.title}
      customHeader={<></>}
      panelClassName={cn(
        "!max-w-[1400px]",
        previewVisible ? "!w-[calc(100vw-280px)]" : "!w-[860px]"
      )}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Left — editor column (has its own header) */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <SlidePanelEditorHeader
            title={editTitle}
            onTitleChange={setEditTitle}
            enabled={editEnabled}
            canEnable={canEnable}
            canSave={canSave}
            onEnable={handleEnable}
            onSave={handleSave}
            onClose={requestClose}
            emptyReason={emptyReason}
            saveDisabledReason={saveDisabledReason}
          />

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write here..."
              autoFocus
              rows={1}
              className="w-full text-[14px] leading-relaxed bg-transparent resize-none outline-none [field-sizing:content] placeholder:text-muted-foreground/40"
            />

            {/* Suggestion pills — directly below textarea when empty */}
            {contentEmpty && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {COMMUNICATION_STYLE_TEMPLATES.slice(0, 3).map((tpl) => (
                  <Tooltip key={tpl.title}>
                    <TooltipTrigger
                      render={
                        <button
                          type="button"
                          onClick={() => {
                            setEditTitle(tpl.title);
                            setEditContent(tpl.description);
                          }}
                          className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[13px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                        />
                      }
                    >
                      {tpl.title}
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-[320px] px-4 py-3">
                      <div>
                        <p className="text-[13px] font-semibold mb-1">{tpl.title}</p>
                        <p className="text-[12.5px] leading-[1.5] text-muted-foreground whitespace-pre-line">
                          {tpl.description}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        onClick={() => setTemplatesOpen(true)}
                        className="inline-flex items-center justify-center rounded-full border border-border w-8 h-8 text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer"
                      />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>All templates</TooltipContent>
                </Tooltip>
              </div>
            )}

            <div className="flex-1" />

            {/* Action buttons — shown when typing */}
            {!contentEmpty && (
              <div className="mt-3 flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" />
                  Optimize
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] text-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                  <Code className="h-3.5 w-3.5" />
                  Insert attribute
                </button>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="border-t border-border/40 px-6 py-3 flex items-center gap-5 shrink-0">
            <span className="text-[13px] text-muted-foreground">
              Used <span className="font-medium text-foreground">{item.stats.used}</span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Resolved <span className="font-medium text-foreground">{item.stats.resolved ?? "—"}</span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Routed <span className="font-medium text-foreground">{item.stats.escalated ?? "—"}</span>
            </span>
            <div className="flex-1" />
            <button
              onClick={() => {
                onDelete(item.id);
                onClose();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right — Preview (reused shared component, X closes only preview column) */}
        {previewVisible && (
          <GuidancePreviewPanel
            className="flex w-[400px] shrink-0 flex-col border-l border-border"
            onClose={() => setPreviewVisible(false)}
            guidance={
              editContent.trim()
                ? [{ title: editTitle || "Guideline", content: editContent }]
                : []
            }
            personality={personality}
          />
        )}
      </div>
    </SlidePanel>
    <TemplatesModal
      open={templatesOpen}
      onClose={() => setTemplatesOpen(false)}
      onSelect={(tpl) => {
        setEditTitle(tpl.title);
        setEditContent(tpl.description);
      }}
    />
    <ConfirmModal
      open={confirmDiscardOpen}
      onClose={() => setConfirmDiscardOpen(false)}
      onConfirm={() => onClose()}
      title="Unsaved Changes"
      description="You haven't finished creating this guidance. If you leave now, your changes will be lost."
      cancelLabel="Keep editing"
      confirmLabel="Discard"
    />
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function GuidancePage() {
  const allItemsRaw = useQuery(api.guidanceItems.list);
  const allItems = useMemo(() => allItemsRaw ?? [], [allItemsRaw]);
  const createItem = useMutation(api.guidanceItems.create);
  const updateItem = useMutation(api.guidanceItems.update);
  const removeItem = useMutation(api.guidanceItems.remove);

  const settings = useQuery(api.guidanceSettings.get);
  const saveSettings = useMutation(api.guidanceSettings.save);

  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ categoryId: string; item: GuidanceItem } | null>(null);

  const savedTone: ToneOption = settings?.tone ?? "friendly";
  const savedLength: LengthOption = settings?.length ?? "standard";

  const personality = useMemo(
    () => ({
      tone: toneOptions.find((t) => t.value === savedTone)?.label,
      length: lengthOptions.find((l) => l.value === savedLength)?.label,
    }),
    [savedTone, savedLength]
  );

  const handleBasicsSave = useCallback(
    async (tone: ToneOption, length: LengthOption) => {
      await saveSettings({ tone, length });
    },
    [saveSettings]
  );

  // Build categories with their items from Convex
  const categories = useMemo<GuidanceCategory[]>(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      items: allItems
        .filter((item) => item.categoryId === cat.id)
        .map((item) => ({
          id: item._id,
          _id: item._id,
          title: item.title,
          content: item.content,
          enabled: item.enabled,
          audience: item.audience,
          channels: item.channels,
          categoryId: item.categoryId,
          stats: {
            used: item.stats.used,
            resolved: item.stats.resolved ?? null,
            escalated: item.stats.escalated ?? null,
          },
        })),
    }));
  }, [allItems]);

  const previewGuidance = useMemo(
    () =>
      allItems
        .filter((i) => i.content.trim().length > 0)
        .map((i) => ({ title: i.title, content: i.content })),
    [allItems]
  );

  const handleSelectItem = useCallback(
    (categoryId: string, item: GuidanceItem) => {
      setSelectedItem({ categoryId, item });
    },
    []
  );

  const handleAddItem = useCallback((categoryId: string) => {
    const newItem: GuidanceItem = {
      id: `new-${Date.now()}`,
      title: "",
      content: "",
      enabled: false,
      isNew: true,
      audience: "Everyone",
      channels: "All channels",
      stats: { used: 0, resolved: null, escalated: null },
    };
    setSelectedItem({ categoryId, item: newItem });
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
            <BasicsCard
              savedTone={savedTone}
              savedLength={savedLength}
              onSave={handleBasicsSave}
            />
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
                onSelectItem={handleSelectItem}
                onAddItem={handleAddItem}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview panel */}
      <GuidancePreviewPanel guidance={previewGuidance} personality={personality} />

      {/* SlidePanel overlay for guidance detail */}
      <GuidanceDetailPanel
        open={!!selectedItem}
        item={selectedItem?.item ?? null}
        personality={personality}
        onClose={() => setSelectedItem(null)}
        onSave={async (updated) => {
          if (!selectedItem) return;
          if (updated._id) {
            await updateItem({
              id: updated._id,
              title: updated.title,
              content: updated.content,
              enabled: updated.enabled,
              audience: updated.audience,
              channels: updated.channels,
            });
          } else {
            await createItem({
              categoryId: selectedItem.categoryId,
              title: updated.title,
              content: updated.content,
              audience: updated.audience,
              channels: updated.channels,
            });
          }
          setSelectedItem(null);
        }}
        onDelete={async () => {
          const item = selectedItem?.item;
          if (item?._id) {
            await removeItem({ id: item._id });
          }
          setSelectedItem(null);
        }}
      />
    </>
  );
}
