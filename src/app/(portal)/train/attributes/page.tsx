"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import {
  AttributesDetailPanel,
  type AttributeDraft,
  type ExistingAttributeRef,
} from "@/components/train/attributes-detail-panel";
import {
  TemplatesModal,
  type GuidanceTemplate,
} from "@/components/train/templates-modal";
import {
  ATTRIBUTE_TEMPLATES,
  type AttributeTemplate,
} from "@/components/train/attribute-templates";
import {
  Tags,
  Search,
  Plus,
  SlidersHorizontal,
  LayoutTemplate,
} from "lucide-react";

function nanoid(): string {
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyDraft(): AttributeDraft {
  return {
    title: "",
    description: "",
    category: "custom",
    enabled: false,
    audience: "Everyone",
    redetectOnClose: false,
    values: [],
    conditions: [],
    stats: { detected: 0 },
  };
}

function draftFromTemplate(tpl: AttributeTemplate): AttributeDraft {
  return {
    title: tpl.title,
    description: tpl.description,
    category: tpl.category,
    enabled: false,
    audience: "Everyone",
    redetectOnClose: false,
    values: tpl.values.map((v) => ({
      id: nanoid(),
      name: v.name,
      description: v.description,
    })),
    conditions: [],
    stats: { detected: 0 },
  };
}

export default function AttributesPage() {
  const attributesData = useQuery(api.attributes.list);
  const attributes = useMemo(() => attributesData ?? [], [attributesData]);
  const createAttr = useMutation(api.attributes.create);
  const updateAttr = useMutation(api.attributes.update);
  const removeAttr = useMutation(api.attributes.remove);

  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<AttributeDraft | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const hasAny = attributes.length > 0;

  const draftId = draft?._id;
  const otherAttributes: ExistingAttributeRef[] = useMemo(
    () =>
      attributes
        .filter((a) => !draftId || a._id !== draftId)
        .map((a) => ({
          _id: a._id,
          title: a.title,
          values: a.values.map((v) => ({ id: v.id, name: v.name })),
        })),
    [attributes, draftId],
  );

  const filteredAttributes = useMemo(() => {
    if (!search.trim()) return attributes;
    const q = search.toLowerCase();
    return attributes.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q),
    );
  }, [attributes, search]);

  const templateModalItems: GuidanceTemplate[] = useMemo(
    () =>
      ATTRIBUTE_TEMPLATES.map((t) => ({
        title: t.title,
        description: t.description,
      })),
    [],
  );

  const handlePickTemplateByTitle = useCallback((t: GuidanceTemplate) => {
    const match = ATTRIBUTE_TEMPLATES.find((a) => a.title === t.title);
    if (match) setDraft(draftFromTemplate(match));
  }, []);

  const handleNew = useCallback(() => {
    setDraft(emptyDraft());
  }, []);

  const handleOpenExisting = useCallback(
    (id: Id<"attributes">) => {
      const a = attributes.find((x) => x._id === id);
      if (!a) return;
      setDraft({
        _id: a._id,
        title: a.title,
        description: a.description,
        category: a.category,
        enabled: a.enabled,
        audience: a.audience,
        redetectOnClose: a.redetectOnClose,
        values: a.values.map((v) => ({ ...v })),
        conditions: a.conditions.map((c) => ({
          id: c.id,
          ifAttributeId: c.ifAttributeId,
          ifValueId: c.ifValueId,
          useValueIds: [...c.useValueIds],
        })),
        stats: a.stats,
      });
    },
    [attributes],
  );

  const handleSave = useCallback(
    async (updated: AttributeDraft) => {
      const sanitizedConditions = updated.conditions
        .filter((c) => c.ifAttributeId !== "")
        .map((c) => ({
          id: c.id,
          ifAttributeId: c.ifAttributeId as Id<"attributes">,
          ifValueId: c.ifValueId,
          useValueIds: c.useValueIds,
        }));

      if (updated._id) {
        await updateAttr({
          id: updated._id,
          title: updated.title,
          description: updated.description,
          category: updated.category,
          enabled: updated.enabled,
          audience: updated.audience,
          redetectOnClose: updated.redetectOnClose,
          values: updated.values,
          conditions: sanitizedConditions,
        });
      } else {
        await createAttr({
          title: updated.title,
          description: updated.description,
          category: updated.category,
          audience: updated.audience,
          values: updated.values,
          conditions: sanitizedConditions,
        });
      }
      setDraft(null);
    },
    [createAttr, updateAttr],
  );

  const handleDelete = useCallback(
    async (id: Id<"attributes">) => {
      await removeAttr({ id });
      setDraft(null);
    },
    [removeAttr],
  );

  const enabledAttributesForPreview = useMemo(
    () =>
      attributes
        .filter(
          (a) =>
            a.enabled && a.values.length >= 2 && a.title.trim().length > 0,
        )
        .map((a) => ({
          id: a._id,
          title: a.title,
          description: a.description,
          values: a.values.map((v) => ({
            id: v.id,
            name: v.name,
            description: v.description,
          })),
        })),
    [attributes],
  );

  return (
    <>
      {/* Main content */}
      <div className="flex-1 overflow-auto rounded-xl bg-white min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Tags className="h-[18px] w-[18px] text-muted-foreground" />
            <h1 className="text-[17px] font-semibold">Attributes</h1>
          </div>
          {hasAny && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-[13px]"
                onClick={() => setTemplatesOpen(true)}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                Templates
              </Button>
              <Button
                size="sm"
                className="rounded-full text-[13px]"
                onClick={handleNew}
              >
                <Plus className="h-3.5 w-3.5" />
                New attribute
              </Button>
            </div>
          )}
        </div>

        {!hasAny ? (
          <div className="px-6 py-16 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-[32px] leading-[1.1] tracking-[-0.01em] text-foreground mb-3">
                Create an attribute
              </h2>
              <p className="text-[14px] text-muted-foreground leading-[1.6] max-w-md mx-auto mb-7">
                Train the agent to detect dimensions like issue type, sentiment,
                or urgency for improved triage, routing, and reporting.
              </p>
              <Button className="rounded-full" onClick={handleNew}>
                <Plus className="h-4 w-4" />
                New attribute
              </Button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-[12.5px] font-medium text-muted-foreground uppercase tracking-wider">
                Start from a template
              </span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {ATTRIBUTE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.key}
                  onClick={() => setDraft(draftFromTemplate(tpl))}
                  className="text-left rounded-lg border border-border/60 p-4 hover:border-foreground/30 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <p className="text-[14px] font-semibold mb-1">{tpl.title}</p>
                  <p className="text-[12.5px] leading-[1.5] text-muted-foreground line-clamp-2">
                    {tpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            {/* Search & Filters */}
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search attributes by name or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 text-[14px]"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 px-4 text-[13px]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Table */}
            {filteredAttributes.length === 0 ? (
              <div className="rounded-lg border border-border/60 border-dashed py-10 px-5 text-center">
                <p className="text-[13px] text-muted-foreground">
                  No attributes match your search.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <div className="grid grid-cols-[1fr_70px_80px_80px] items-center gap-4 px-5 py-2.5 border-b border-border/60">
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Name
                  </span>
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Values
                  </span>
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Status
                  </span>
                  <span className="text-[13px] font-medium text-muted-foreground">
                    Detected
                  </span>
                </div>
                {filteredAttributes.map((a, i) => (
                  <AttributeRow
                    key={a._id}
                    title={a.title}
                    description={a.description}
                    valueCount={a.values.length}
                    enabled={a.enabled}
                    detected={a.stats.detected}
                    isLast={i === filteredAttributes.length - 1}
                    onClick={() => handleOpenExisting(a._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview panel */}
      <GuidancePreviewPanel attributes={enabledAttributesForPreview} />

      {/* Detail panel */}
      <AttributesDetailPanel
        open={draft !== null}
        draft={draft}
        otherAttributes={otherAttributes}
        onClose={() => setDraft(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* Templates modal */}
      <TemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handlePickTemplateByTitle}
        title="Attribute templates"
        templates={templateModalItems}
      />
    </>
  );
}

function AttributeRow({
  title,
  description,
  valueCount,
  enabled,
  detected,
  isLast,
  onClick,
}: {
  title: string;
  description: string;
  valueCount: number;
  enabled: boolean;
  detected: number;
  isLast: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left grid grid-cols-[1fr_70px_80px_80px] items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer",
        !isLast && "border-b border-border/40",
      )}
    >
      <div className="min-w-0">
        <p className="text-[14px] font-medium truncate">
          {title || "Untitled"}
        </p>
        {description && (
          <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <span className="text-[13px] text-muted-foreground">{valueCount}</span>
      <Badge
        variant="outline"
        className={cn(
          "text-[11px] font-normal w-fit",
          enabled && "border-emerald-200 bg-emerald-50 text-emerald-700",
        )}
      >
        {enabled ? "Live" : "Draft"}
      </Badge>
      <span className="text-[13px] text-muted-foreground">{detected}</span>
    </button>
  );
}
