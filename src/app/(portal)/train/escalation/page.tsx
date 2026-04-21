"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import {
  EscalationRuleTableRow,
  narrowDraftCondition,
  type EscalationRuleDraft,
  type AttributeRef,
} from "@/components/train/escalation-rule-row";
import { EscalationRuleSlidePanel } from "@/components/train/escalation-rule-slide-panel";
import {
  EscalationGuidancePanel,
  type EscalationGuidanceItem,
} from "@/components/train/escalation-guidance-panel";
import { EscalationGuidanceRow } from "@/components/train/escalation-guidance-row";
import {
  Shield,
  Plus,
  Code,
  MessageSquare,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type ToneOption = "friendly" | "neutral" | "matter-of-fact" | "professional" | "humorous";

const toneLabels: Record<ToneOption, string> = {
  friendly: "Friendly",
  neutral: "Neutral",
  "matter-of-fact": "Matter-of-fact",
  professional: "Professional",
  humorous: "Humorous",
};

const lengthLabels: Record<"concise" | "standard" | "thorough", string> = {
  concise: "Concise",
  standard: "Standard",
  thorough: "Thorough",
};

export default function EscalationPage() {
  const rulesQuery = useQuery(api.escalationRules.list);
  const createRule = useMutation(api.escalationRules.create);
  const updateRule = useMutation(api.escalationRules.update);
  const removeRule = useMutation(api.escalationRules.remove);

  const guidanceQuery = useQuery(api.escalationGuidance.list);
  const createGuidance = useMutation(api.escalationGuidance.create);
  const updateGuidance = useMutation(api.escalationGuidance.update);
  const removeGuidance = useMutation(api.escalationGuidance.remove);

  const attributesData = useQuery(api.attributes.list);
  const settings = useQuery(api.guidanceSettings.get);

  const enabledAttributes: AttributeRef[] = useMemo(
    () =>
      (attributesData ?? [])
        .filter((a) => a.enabled && a.values.length >= 2)
        .map((a) => ({
          _id: a._id,
          title: a.title,
          values: a.values.map((v) => ({ id: v.id, name: v.name })),
        })),
    [attributesData],
  );

  const [selectedRule, setSelectedRule] = useState<EscalationRuleDraft | null>(null);
  const [selectedGuidance, setSelectedGuidance] =
    useState<EscalationGuidanceItem | null>(null);
  const [search, setSearch] = useState("");

  const ruleDrafts = useMemo<EscalationRuleDraft[]>(
    () =>
      (rulesQuery ?? []).map((r) => ({
        _id: r._id,
        title: r.title,
        enabled: r.enabled,
        conditionGroups: r.conditionGroups.map((g) => ({
          id: g.id,
          conditions: g.conditions.map((c) => ({ ...c })),
        })),
        stats: r.stats,
      })),
    [rulesQuery],
  );

  const filteredRules = useMemo(() => {
    if (!search.trim()) return ruleDrafts;
    const q = search.toLowerCase();
    return ruleDrafts.filter((r) => r.title.toLowerCase().includes(q));
  }, [ruleDrafts, search]);

  const filteredGuidance = useMemo(() => {
    const items = guidanceQuery ?? [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.content.toLowerCase().includes(q),
    );
  }, [guidanceQuery, search]);

  const handleNewRule = useCallback(() => {
    const draft: EscalationRuleDraft = {
      title: "",
      enabled: false,
      conditionGroups: [],
      stats: { matched: 0 },
    };
    setSelectedRule(draft);
  }, []);

  const handleSaveRule = useCallback(
    async (draft: EscalationRuleDraft) => {
      const conditionGroups = draft.conditionGroups.map((g) => ({
        id: g.id,
        conditions: g.conditions
          .map(narrowDraftCondition)
          .filter((c): c is NonNullable<typeof c> => c !== null)
          .map((c) =>
            c.kind === "attribute"
              ? { ...c, attributeId: c.attributeId as Id<"attributes"> }
              : c,
          ),
      }));

      if (draft._id) {
        await updateRule({
          id: draft._id,
          title: draft.title,
          enabled: draft.enabled,
          conditionGroups,
        });
      } else {
        const newId = await createRule({
          title: draft.title,
          conditionGroups,
        });
        if (draft.enabled) {
          await updateRule({ id: newId, enabled: true });
        }
      }
      setSelectedRule(null);
    },
    [createRule, updateRule],
  );

  const handleDeleteRule = useCallback(
    async (id: Id<"escalationRules">) => {
      await removeRule({ id });
      setSelectedRule(null);
    },
    [removeRule],
  );

  const handleOpenGuidance = useCallback((g: EscalationGuidanceItem) => {
    setSelectedGuidance(g);
  }, []);

  const handleNewGuidance = useCallback(() => {
    setSelectedGuidance({
      title: "",
      content: "",
      enabled: false,
      audience: "Everyone",
      channels: "All channels",
      isNew: true,
    });
  }, []);

  const handleSaveGuidance = useCallback(
    async (updated: EscalationGuidanceItem) => {
      if (updated._id) {
        await updateGuidance({
          id: updated._id,
          title: updated.title,
          content: updated.content,
          enabled: updated.enabled,
          audience: updated.audience,
          channels: updated.channels,
        });
      } else {
        await createGuidance({
          title: updated.title,
          content: updated.content,
          audience: updated.audience,
          channels: updated.channels,
        });
      }
      setSelectedGuidance(null);
    },
    [createGuidance, updateGuidance],
  );

  const handleDeleteGuidance = useCallback(
    async (id: Id<"escalationGuidance">) => {
      await removeGuidance({ id });
      setSelectedGuidance(null);
    },
    [removeGuidance],
  );

  const personality = useMemo(
    () => ({
      tone: settings ? toneLabels[settings.tone] : undefined,
      length: settings ? lengthLabels[settings.length] : undefined,
    }),
    [settings],
  );

  const enabledRulesForPreview = useMemo(
    () =>
      ruleDrafts
        .filter((r) => r.enabled && r.conditionGroups.length > 0)
        .map((r) => ({
          _id: r._id as unknown as string,
          title: r.title,
          enabled: true,
          conditionGroups: r.conditionGroups.map((g) => ({
            id: g.id,
            conditions: g.conditions
              .map(narrowDraftCondition)
              .filter((c): c is NonNullable<typeof c> => c !== null),
          })),
        })),
    [ruleDrafts],
  );

  const enabledGuidanceForPreview = useMemo(
    () =>
      (guidanceQuery ?? [])
        .filter((g) => g.enabled && g.content.trim().length > 0)
        .map((g) => ({ _id: g._id, title: g.title, content: g.content })),
    [guidanceQuery],
  );

  const enabledAttributesForPreview = useMemo(
    () =>
      (attributesData ?? [])
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
          conditions: a.conditions.map((c) => ({
            id: c.id,
            ifAttributeId: c.ifAttributeId as string,
            ifValueId: c.ifValueId,
            useValueIds: c.useValueIds,
          })),
        })),
    [attributesData],
  );

  const hasRules = filteredRules.length > 0;
  const hasGuidance = filteredGuidance.length > 0;

  return (
    <>
      <div className="flex-1 overflow-auto rounded-xl bg-white min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-2.5">
            <Shield className="h-[18px] w-[18px] text-muted-foreground" />
            <h1 className="text-[17px] font-semibold">Escalation</h1>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Search & Filters */}
          <div className="mb-7 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rules and guidance"
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

          <div className="space-y-8">
            {/* Rules section */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 shrink-0">
                  <Code className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold">Escalation rules</p>
                  <p className="text-[14px] text-muted-foreground mt-0.5">
                    Deterministic conditions that always hand off when matched.
                  </p>
                </div>
              </div>

              {hasRules ? (
                <div className="rounded-lg border border-border overflow-hidden mb-2">
                  <div className="grid grid-cols-[1fr_80px_60px_80px_80px] items-center gap-4 px-5 py-2.5 border-b border-border bg-muted/20">
                    <span className="text-[13px] font-medium text-muted-foreground">Name</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Status</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Used</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Resolved</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Escalated</span>
                  </div>
                  {filteredRules.map((r, i) => (
                    <EscalationRuleTableRow
                      key={r._id ?? `new-${i}`}
                      rule={r}
                      attributes={enabledAttributes}
                      isLast={i === filteredRules.length - 1}
                      onClick={() => setSelectedRule(r)}
                    />
                  ))}
                </div>
              ) : search.trim() ? (
                <div className="rounded-lg border border-border py-6 px-5 text-center mb-2">
                  <p className="text-[13px] text-muted-foreground">
                    No rules match your search.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border py-6 px-5 text-center mb-2">
                  <p className="text-[13px] text-muted-foreground">
                    No rules yet. Click New to create one.
                  </p>
                </div>
              )}

              <Button
                variant="secondary"
                className="rounded-full mt-2"
                onClick={handleNewRule}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </section>

            {/* Guidance section */}
            <section>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 shrink-0">
                  <MessageSquare
                    className="h-[18px] w-[18px] text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold">Escalation guidance</p>
                  <p className="text-[14px] text-muted-foreground mt-0.5">
                    Natural-language instructions the agent interprets when deciding
                    to hand off.
                  </p>
                </div>
              </div>

              {hasGuidance ? (
                <div className="rounded-lg border border-border overflow-hidden mb-2">
                  <div className="grid grid-cols-[1fr_80px_60px_80px_80px] items-center gap-4 px-5 py-2.5 border-b border-border bg-muted/20">
                    <span className="text-[13px] font-medium text-muted-foreground">Name</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Status</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Used</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Resolved</span>
                    <span className="text-[13px] font-medium text-muted-foreground">Escalated</span>
                  </div>
                  {filteredGuidance.map((g, i) => (
                    <EscalationGuidanceRow
                      key={g._id}
                      title={g.title}
                      content={g.content}
                      enabled={g.enabled}
                      used={g.stats.used}
                      escalated={g.stats.escalated}
                      isLast={i === filteredGuidance.length - 1}
                      onClick={() =>
                        handleOpenGuidance({
                          _id: g._id,
                          title: g.title,
                          content: g.content,
                          enabled: g.enabled,
                          audience: g.audience,
                          channels: g.channels,
                        })
                      }
                    />
                  ))}
                </div>
              ) : search.trim() ? (
                <div className="rounded-lg border border-border py-6 px-5 text-center mb-2">
                  <p className="text-[13px] text-muted-foreground">
                    No guidance matches your search.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border py-6 px-5 text-center mb-2">
                  <p className="text-[13px] text-muted-foreground">
                    No guidance yet. Click New to create one.
                  </p>
                </div>
              )}

              <Button
                variant="secondary"
                className="rounded-full mt-2"
                onClick={handleNewGuidance}
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </section>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      <GuidancePreviewPanel
        personality={personality}
        attributes={enabledAttributesForPreview}
        escalationRules={enabledRulesForPreview}
        escalationGuidance={enabledGuidanceForPreview}
      />

      {/* Rule editor slide panel */}
      <EscalationRuleSlidePanel
        open={selectedRule !== null}
        rule={selectedRule}
        attributes={enabledAttributes}
        onClose={() => setSelectedRule(null)}
        onSave={handleSaveRule}
        onDelete={handleDeleteRule}
      />

      {/* Guidance editor slide panel */}
      <EscalationGuidancePanel
        open={selectedGuidance !== null}
        item={selectedGuidance}
        personality={personality}
        onClose={() => setSelectedGuidance(null)}
        onSave={handleSaveGuidance}
        onDelete={handleDeleteGuidance}
      />
    </>
  );
}
