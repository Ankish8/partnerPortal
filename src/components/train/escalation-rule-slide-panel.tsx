"use client";

import { useState, useMemo, useEffect } from "react";
import { X, Play, Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SlidePanel } from "@/components/ui/slide-panel";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { Id } from "../../../convex/_generated/dataModel";
import type { SystemFieldKey } from "@/lib/escalation-system-fields";
import {
  type EscalationRuleDraft,
  type EscalationConditionDraft,
  type EscalationConditionGroupDraft,
  type AttributeRef,
  ConditionPill,
  GroupConnector,
  AddInlineButton,
  emptyConditionForField,
  isConditionComplete,
  nanoid,
} from "./escalation-rule-editor-primitives";
import {
  ModeSelect,
  AudienceSelect,
  ChannelSelect,
  RULE_MODE_OPTIONS,
} from "./escalation-meta-selects";

interface Props {
  open: boolean;
  rule: EscalationRuleDraft | null;
  attributes: AttributeRef[];
  onClose: () => void;
  onSave: (updated: EscalationRuleDraft) => void | Promise<void>;
  onDelete: (id: Id<"escalationRules">) => void | Promise<void>;
}

export function EscalationRuleSlidePanel({
  open,
  rule,
  attributes,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [state, setState] = useState<EscalationRuleDraft | null>(rule);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  useEffect(() => {
    setState(rule);
  }, [rule]);

  const hasChanges = useMemo(() => {
    if (!state || !rule) return false;
    return JSON.stringify(state) !== JSON.stringify(rule);
  }, [state, rule]);

  const isValid = useMemo(() => {
    if (!state) return false;
    if (!state.title.trim()) return false;
    if (state.conditionGroups.length === 0) return false;
    for (const group of state.conditionGroups) {
      if (group.conditions.length === 0) return false;
      for (const c of group.conditions) {
        if (!isConditionComplete(c)) return false;
      }
    }
    return true;
  }, [state]);

  if (!rule || !state) return null;
  const isNew = !rule._id;

  const updateCondition = (
    groupId: string,
    conditionId: string,
    patch: Partial<EscalationConditionDraft>,
  ) => {
    setState((s) =>
      s
        ? {
            ...s,
            conditionGroups: s.conditionGroups.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    conditions: g.conditions.map((c) =>
                      c.id === conditionId ? ({ ...c, ...patch } as EscalationConditionDraft) : c,
                    ),
                  }
                : g,
            ),
          }
        : s,
    );
  };

  const changeConditionKind = (
    groupId: string,
    conditionId: string,
    fieldKey: SystemFieldKey | "attribute",
    attributeId?: Id<"attributes">,
  ) => {
    setState((s) =>
      s
        ? {
            ...s,
            conditionGroups: s.conditionGroups.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    conditions: g.conditions.map((c) =>
                      c.id === conditionId
                        ? { ...emptyConditionForField(fieldKey, attributeId), id: c.id }
                        : c,
                    ),
                  }
                : g,
            ),
          }
        : s,
    );
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setState((s) =>
      s
        ? {
            ...s,
            conditionGroups: s.conditionGroups
              .map((g) =>
                g.id === groupId
                  ? { ...g, conditions: g.conditions.filter((c) => c.id !== conditionId) }
                  : g,
              )
              .filter((g) => g.conditions.length > 0),
          }
        : s,
    );
  };

  const addGroup = (afterGroupId?: string) => {
    const newGroup: EscalationConditionGroupDraft = {
      id: nanoid(),
      conditions: [
        attributes.length > 0
          ? emptyConditionForField("attribute", attributes[0]._id)
          : emptyConditionForField("message_content"),
      ],
    };
    setState((s) => {
      if (!s) return s;
      if (!afterGroupId) {
        return { ...s, conditionGroups: [...s.conditionGroups, newGroup] };
      }
      const idx = s.conditionGroups.findIndex((g) => g.id === afterGroupId);
      if (idx === -1) return { ...s, conditionGroups: [...s.conditionGroups, newGroup] };
      const next = [...s.conditionGroups];
      next.splice(idx + 1, 0, newGroup);
      return { ...s, conditionGroups: next };
    });
  };

  const handleSave = () => {
    if (!isValid || !hasChanges) return;
    onSave(state);
  };

  const handleEnableToggle = () => {
    if (!isValid) return;
    onSave({ ...state, enabled: !state.enabled });
  };

  const handleDelete = () => {
    if (state._id) {
      onDelete(state._id);
    } else {
      onClose();
    }
  };

  const requestClose = () => {
    if (hasChanges) setConfirmDiscardOpen(true);
    else onClose();
  };

  const hasConditions = state.conditionGroups.some((g) => g.conditions.length > 0);

  const titleEmpty = !state.title.trim();
  const canEnable = isValid;
  const canSave = isValid && hasChanges;
  const saveDisabledReason = titleEmpty
    ? "Rule title can't be empty"
    : !hasConditions
    ? "Add at least one condition"
    : !isValid
    ? "Some conditions are incomplete"
    : !hasChanges
    ? "No changes to save"
    : null;

  const enableDisabledReason = titleEmpty
    ? "Rule title can't be empty"
    : !hasConditions
    ? "Add at least one condition"
    : !isValid
    ? "Some conditions are incomplete"
    : null;

  return (
    <>
      <SlidePanel
        open={open}
        onClose={requestClose}
        title={state.title || "Untitled"}
        customHeader={<></>}
        panelClassName="!w-[860px] !max-w-[calc(100vw-280px)]"
      >
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Header — title + Enable / Save / X */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <div className="flex items-center min-w-0">
              <input
                type="text"
                value={state.title}
                onChange={(e) =>
                  setState((s) => (s ? { ...s, title: e.target.value } : s))
                }
                placeholder="Untitled"
                size={Math.max((state.title || "Untitled").length, 8)}
                className="text-[17px] font-semibold bg-transparent outline-none border-b border-dotted border-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={handleEnableToggle}
                      aria-disabled={!canEnable}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full h-8 px-3.5 text-[13px] font-medium transition-colors",
                        !canEnable
                          ? "bg-secondary text-secondary-foreground/60 cursor-not-allowed"
                          : state.enabled
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer",
                      )}
                    />
                  }
                >
                  <Play className="h-3 w-3 fill-current" />
                  {state.enabled ? "Disable" : "Enable"}
                </TooltipTrigger>
                {!canEnable && enableDisabledReason && (
                  <TooltipContent>{enableDisabledReason}</TooltipContent>
                )}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={handleSave}
                      aria-disabled={!canSave}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full h-8 px-3.5 text-[13px] font-medium transition-colors",
                        canSave
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                          : "bg-secondary text-secondary-foreground/60 cursor-not-allowed",
                      )}
                    />
                  }
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </TooltipTrigger>
                {!canSave && saveDisabledReason && (
                  <TooltipContent>{saveDisabledReason}</TooltipContent>
                )}
              </Tooltip>

              <button
                onClick={requestClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable conditions area */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Behavior row */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-muted-foreground">
                When matched
              </span>
              <ModeSelect
                value={state.mode ?? "immediate"}
                onChange={(v) => setState((s) => (s ? { ...s, mode: v } : s))}
                options={RULE_MODE_OPTIONS}
              />
              <span className="mx-2 text-muted-foreground/40">·</span>
              <AudienceSelect
                value={state.audience ?? "Everyone"}
                onChange={(v) =>
                  setState((s) => (s ? { ...s, audience: v } : s))
                }
              />
              <ChannelSelect
                value={state.channels ?? "All channels"}
                onChange={(v) =>
                  setState((s) => (s ? { ...s, channels: v } : s))
                }
              />
            </div>
            <p className="text-[13px] font-semibold text-foreground mb-3">Conditions</p>
            <div className="flex items-center gap-2 flex-wrap">
              {hasConditions &&
                state.conditionGroups.map((group, gIdx) => (
                  <div key={group.id} className="flex items-center gap-2">
                    {gIdx > 0 && (
                      <GroupConnector
                        value="and"
                        onChange={() => {
                          /* OR groups are the model; connector is visual */
                        }}
                      />
                    )}
                    {group.conditions.map((cond, cIdx) => (
                      <div key={cond.id} className="flex items-center gap-1.5">
                        {cIdx > 0 && (
                          <span className="text-[12.5px] text-muted-foreground">and</span>
                        )}
                        <ConditionPill
                          condition={cond}
                          attributes={attributes}
                          groupIndex={gIdx}
                          onChangeKind={(fieldKey, attrId) =>
                            changeConditionKind(group.id, cond.id, fieldKey, attrId)
                          }
                          onUpdate={(patch) => updateCondition(group.id, cond.id, patch)}
                          onRemove={() => removeCondition(group.id, cond.id)}
                        />
                      </div>
                    ))}
                    <AddInlineButton
                      onClick={() => addGroup(group.id)}
                      tooltip="Create a filter group"
                    />
                  </div>
                ))}
              <button
                type="button"
                onClick={() => addGroup()}
                className="inline-flex items-center gap-1 text-[13px] text-[#e87537] hover:text-[#d16a30] transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add condition
              </button>
            </div>
          </div>

          {/* Footer — stats + delete */}
          <div className="border-t border-border/40 px-6 py-3 flex items-center gap-5 shrink-0">
            <span className="text-[13px] text-muted-foreground">
              Used{" "}
              <span className="font-medium text-foreground">{state.stats.matched}</span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Resolved <span className="font-medium text-foreground">—</span>
            </span>
            <span className="text-[13px] text-muted-foreground">
              Escalated <span className="font-medium text-foreground">—</span>
            </span>
            <div className="flex-1" />
            {!isNew && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </SlidePanel>
      <ConfirmModal
        open={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={() => {
          setConfirmDiscardOpen(false);
          onClose();
        }}
        title="Unsaved Changes"
        description="You haven't finished editing this rule. If you leave now, your changes will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
      />
    </>
  );
}
