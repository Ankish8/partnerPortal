"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { GuidancePreviewPanel } from "@/components/train/guidance-preview-panel";
import {
  EscalationRuleRow,
  emptyConditionGroupDraft,
  narrowDraftCondition,
  type EscalationRuleDraft,
  type AttributeRef,
} from "@/components/train/escalation-rule-row";
import {
  EscalationGuidancePanel,
  type EscalationGuidanceItem,
} from "@/components/train/escalation-guidance-panel";
import { EscalationGuidanceChip } from "@/components/train/escalation-guidance-chip";
import { ESCALATION_GUIDANCE_SEEDS } from "@/components/train/escalation-templates";
import { Shield, Plus, Zap, MessageSquare } from "lucide-react";

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
  const rules = useQuery(api.escalationRules.list);
  const createRule = useMutation(api.escalationRules.create);
  const updateRule = useMutation(api.escalationRules.update);
  const removeRule = useMutation(api.escalationRules.remove);

  const guidanceItems = useQuery(api.escalationGuidance.list);
  const createGuidance = useMutation(api.escalationGuidance.create);
  const updateGuidance = useMutation(api.escalationGuidance.update);
  const removeGuidance = useMutation(api.escalationGuidance.remove);
  const ensureSeeded = useMutation(api.escalationGuidance.ensureSeeded);

  const attributesData = useQuery(api.attributes.list);
  const settings = useQuery(api.guidanceSettings.get);

  // Seed guidance defaults once (idempotent).
  useEffect(() => {
    if (guidanceItems === undefined) return;
    if (guidanceItems.length === 0) {
      ensureSeeded({ items: ESCALATION_GUIDANCE_SEEDS }).catch(() => {});
    }
  }, [guidanceItems, ensureSeeded]);

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

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newDraft, setNewDraft] = useState<EscalationRuleDraft | null>(null);
  const [selectedGuidance, setSelectedGuidance] =
    useState<EscalationGuidanceItem | null>(null);

  const ruleDrafts = useMemo<EscalationRuleDraft[]>(
    () =>
      (rules ?? []).map((r) => ({
        _id: r._id,
        title: r.title,
        enabled: r.enabled,
        conditionGroups: r.conditionGroups.map((g) => ({
          id: g.id,
          conditions: g.conditions.map((c) => ({ ...c })),
        })),
        stats: r.stats,
      })),
    [rules],
  );

  const handleNewRule = useCallback(() => {
    const draft: EscalationRuleDraft = {
      title: "",
      enabled: false,
      conditionGroups: [emptyConditionGroupDraft(enabledAttributes)],
      stats: { matched: 0 },
    };
    setNewDraft(draft);
    setExpandedId("__new__");
  }, [enabledAttributes]);

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
        setNewDraft(null);
        setExpandedId(newId);
      }
    },
    [createRule, updateRule],
  );

  const handleDeleteRule = useCallback(
    async (id: Id<"escalationRules">) => {
      await removeRule({ id });
      if (expandedId === id) setExpandedId(null);
    },
    [removeRule, expandedId],
  );

  const handleOpenGuidance = (g: EscalationGuidanceItem) => {
    setSelectedGuidance(g);
  };

  const handleNewGuidance = () => {
    setSelectedGuidance({
      title: "",
      content: "",
      enabled: false,
      audience: "Everyone",
      channels: "All channels",
      isNew: true,
    });
  };

  const handleSaveGuidance = async (updated: EscalationGuidanceItem) => {
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
  };

  const handleDeleteGuidance = async (id: Id<"escalationGuidance">) => {
    await removeGuidance({ id });
    setSelectedGuidance(null);
  };

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
      (guidanceItems ?? [])
        .filter((g) => g.enabled && g.content.trim().length > 0)
        .map((g) => ({ title: g.title, content: g.content })),
    [guidanceItems],
  );

  const loading = rules === undefined || guidanceItems === undefined;

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
          {/* Intro */}
          <p className="text-[13px] leading-[1.6] text-muted-foreground mb-7 max-w-2xl">
            Decide when your AI agent should hand off a conversation to a human.
            Use <span className="font-medium text-foreground">Rules</span> for
            deterministic handoffs based on detected attributes or message
            signals, and use{" "}
            <span className="font-medium text-foreground">Guidance</span> for
            natural-language handoffs the agent interprets in context.
          </p>

          {/* Rules section */}
          <section className="mb-9">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 shrink-0">
                <Zap className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold">Escalation rules</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Deterministic conditions that always hand off when matched.
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full text-[13px]"
                onClick={handleNewRule}
              >
                <Plus className="h-3.5 w-3.5" />
                New rule
              </Button>
            </div>

            {loading ? (
              <div className="rounded-lg border border-border/60 py-8 text-center">
                <p className="text-[13px] text-muted-foreground">Loading...</p>
              </div>
            ) : ruleDrafts.length === 0 && !newDraft ? (
              <div className="rounded-lg border border-border/60 py-10 px-5 text-center">
                <p className="text-[14px] font-medium mb-1">No rules yet</p>
                <p className="text-[13px] text-muted-foreground mb-4">
                  Create a rule to automatically escalate when specific attributes
                  or signals are detected.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-[13px]"
                  onClick={handleNewRule}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create first rule
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <div className="grid grid-cols-[minmax(200px,1.4fr)_1.6fr_1fr_80px] items-center gap-4 px-5 py-2.5 border-b border-border/60 bg-muted/20">
                  <span className="text-[12px] font-medium text-muted-foreground">
                    Rule
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    Conditions
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    Status
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    Matched
                  </span>
                </div>
                {ruleDrafts.map((r, i) => (
                  <EscalationRuleRow
                    key={r._id}
                    rule={r}
                    attributes={enabledAttributes}
                    isExpanded={expandedId === r._id}
                    onToggleExpand={() =>
                      setExpandedId((prev) => (prev === r._id ? null : (r._id as string)))
                    }
                    onSave={handleSaveRule}
                    onDelete={handleDeleteRule}
                    isLast={!newDraft && i === ruleDrafts.length - 1}
                  />
                ))}
                {newDraft && (
                  <EscalationRuleRow
                    rule={newDraft}
                    attributes={enabledAttributes}
                    isExpanded={expandedId === "__new__"}
                    onToggleExpand={() =>
                      setExpandedId((prev) =>
                        prev === "__new__" ? null : "__new__",
                      )
                    }
                    onSave={async (draft) => {
                      await handleSaveRule(draft);
                    }}
                    onDelete={async () => {
                      setNewDraft(null);
                      setExpandedId(null);
                    }}
                    onCancelNew={() => {
                      setNewDraft(null);
                      setExpandedId(null);
                    }}
                    isLast
                    isNew
                  />
                )}
              </div>
            )}
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
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Natural-language instructions the agent interprets when deciding
                  to hand off.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 px-4 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                {(guidanceItems ?? []).map((g) => (
                  <EscalationGuidanceChip
                    key={g._id}
                    title={g.title}
                    content={g.content}
                    enabled={g.enabled}
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
                <button
                  type="button"
                  onClick={handleNewGuidance}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[12.5px] text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New guidance
                </button>
              </div>
              {guidanceItems && guidanceItems.length === 0 && (
                <p className="mt-2 text-[12.5px] text-muted-foreground">
                  Seeding default guidance...
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Preview panel */}
      <GuidancePreviewPanel
        personality={personality}
        escalationRules={enabledRulesForPreview}
        escalationGuidance={enabledGuidanceForPreview}
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
