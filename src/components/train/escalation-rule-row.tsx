"use client";

import { useState, useMemo, useRef, useEffect, useId } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Play,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateHeight } from "@/components/ui/animate-height";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ESCALATION_LANGUAGES,
  ESCALATION_SYSTEM_FIELDS,
  type SystemFieldKey,
  operatorLabel,
} from "@/lib/escalation-system-fields";
import type { EscalationCondition } from "@/lib/escalation-evaluator";

function nanoid(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface EscalationConditionDraft {
  kind: EscalationCondition["kind"];
  id: string;
  attributeId?: Id<"attributes"> | "";
  operator: string;
  valueIds?: string[];
  text?: string;
  languages?: string[];
  value?: number;
}

export interface EscalationConditionGroupDraft {
  id: string;
  conditions: EscalationConditionDraft[];
}

export interface EscalationRuleDraft {
  _id?: Id<"escalationRules">;
  title: string;
  enabled: boolean;
  conditionGroups: EscalationConditionGroupDraft[];
  stats: { matched: number };
}

export interface AttributeRef {
  _id: Id<"attributes">;
  title: string;
  values: { id: string; name: string }[];
}

interface Props {
  rule: EscalationRuleDraft;
  attributes: AttributeRef[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSave: (updated: EscalationRuleDraft) => void | Promise<void>;
  onDelete: (id: Id<"escalationRules">) => void | Promise<void>;
  onCancelNew?: () => void;
  isLast: boolean;
  isNew?: boolean;
}

function emptyConditionForField(
  fieldKey: SystemFieldKey | "attribute",
  attributeId?: Id<"attributes">,
): EscalationConditionDraft {
  switch (fieldKey) {
    case "attribute":
      return {
        kind: "attribute",
        id: nanoid(),
        attributeId: attributeId ?? ("" as Id<"attributes"> | ""),
        operator: "is_any_of",
        valueIds: [],
      };
    case "message_content":
      return {
        kind: "message_content",
        id: nanoid(),
        operator: "contains",
        text: "",
      };
    case "detected_language":
      return {
        kind: "detected_language",
        id: nanoid(),
        operator: "is_any_of",
        languages: [],
      };
    case "turn_count":
      return {
        kind: "turn_count",
        id: nanoid(),
        operator: "gte",
        value: 3,
      };
  }
}

export function narrowDraftCondition(
  c: EscalationConditionDraft,
): EscalationCondition | null {
  if (c.kind === "attribute") {
    if (!c.attributeId) return null;
    return {
      kind: "attribute",
      id: c.id,
      attributeId: c.attributeId as string,
      operator: c.operator as "is_any_of" | "is_none_of",
      valueIds: c.valueIds ?? [],
    };
  }
  if (c.kind === "message_content") {
    return {
      kind: "message_content",
      id: c.id,
      operator: c.operator as "contains" | "not_contains",
      text: c.text ?? "",
    };
  }
  if (c.kind === "detected_language") {
    return {
      kind: "detected_language",
      id: c.id,
      operator: c.operator as "is_any_of" | "is_none_of",
      languages: c.languages ?? [],
    };
  }
  return {
    kind: "turn_count",
    id: c.id,
    operator: c.operator as "gt" | "gte" | "lt" | "lte" | "equals",
    value: c.value ?? 0,
  };
}

export function emptyConditionGroupDraft(
  attributes: AttributeRef[],
): EscalationConditionGroupDraft {
  return {
    id: nanoid(),
    conditions: [
      emptyConditionForField(
        attributes.length > 0 ? "attribute" : "message_content",
        attributes[0]?._id,
      ),
    ],
  };
}

function summarizeRule(
  rule: EscalationRuleDraft,
  attributes: AttributeRef[],
): string {
  const parts: string[] = [];
  for (const group of rule.conditionGroups) {
    const groupParts: string[] = [];
    for (const c of group.conditions) {
      if (c.kind === "attribute") {
        const attr = attributes.find((a) => a._id === c.attributeId);
        const valNames =
          attr && c.valueIds
            ? c.valueIds
                .map((vid) => attr.values.find((v) => v.id === vid)?.name ?? "?")
                .filter(Boolean)
                .join(", ")
            : "";
        groupParts.push(
          `${attr?.title ?? "Attribute"} ${operatorLabel("attribute", c.operator)} ${valNames || "—"}`,
        );
      } else if (c.kind === "message_content") {
        groupParts.push(
          `Message ${operatorLabel("message_content", c.operator)} "${c.text ?? ""}"`,
        );
      } else if (c.kind === "detected_language") {
        const langs = (c.languages ?? []).join(", ");
        groupParts.push(
          `Language ${operatorLabel("detected_language", c.operator)} ${langs || "—"}`,
        );
      } else if (c.kind === "turn_count") {
        groupParts.push(
          `Turn ${operatorLabel("turn_count", c.operator)} ${c.value ?? 0}`,
        );
      }
    }
    if (groupParts.length > 0) parts.push(groupParts.join(" AND "));
  }
  if (parts.length === 0) return "No conditions";
  return parts.join(" OR ");
}

export function EscalationRuleRow({
  rule,
  attributes,
  isExpanded,
  onToggleExpand,
  onSave,
  onDelete,
  onCancelNew,
  isLast,
  isNew,
}: Props) {
  const [state, setState] = useState<EscalationRuleDraft>(rule);
  const [prevRule, setPrevRule] = useState<EscalationRuleDraft>(rule);

  if (rule !== prevRule) {
    setPrevRule(rule);
    setState(rule);
  }

  const hasChanges = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(rule),
    [state, rule],
  );

  const isValid = useMemo(() => {
    if (!state.title.trim()) return false;
    if (state.conditionGroups.length === 0) return false;
    for (const group of state.conditionGroups) {
      if (group.conditions.length === 0) return false;
      for (const c of group.conditions) {
        if (c.kind === "attribute") {
          if (!c.attributeId) return false;
          if (!c.valueIds || c.valueIds.length === 0) return false;
        } else if (c.kind === "message_content") {
          if (!c.text?.trim()) return false;
        } else if (c.kind === "detected_language") {
          if (!c.languages || c.languages.length === 0) return false;
        } else if (c.kind === "turn_count") {
          if (c.value === undefined || !Number.isFinite(c.value)) return false;
        }
      }
    }
    return true;
  }, [state]);

  const addCondition = (groupId: string, kind: SystemFieldKey | "attribute") => {
    setState((s) => ({
      ...s,
      conditionGroups: s.conditionGroups.map((g) =>
        g.id === groupId
          ? { ...g, conditions: [...g.conditions, emptyConditionForField(kind)] }
          : g,
      ),
    }));
  };

  const addConditionGroup = () => {
    setState((s) => ({
      ...s,
      conditionGroups: [
        ...s.conditionGroups,
        {
          id: nanoid(),
          conditions: [
            attributes.length > 0
              ? emptyConditionForField("attribute", attributes[0]._id)
              : emptyConditionForField("message_content"),
          ],
        },
      ],
    }));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setState((s) => ({
      ...s,
      conditionGroups: s.conditionGroups
        .map((g) =>
          g.id === groupId
            ? { ...g, conditions: g.conditions.filter((c) => c.id !== conditionId) }
            : g,
        )
        .filter((g) => g.conditions.length > 0),
    }));
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    patch: Partial<EscalationConditionDraft>,
  ) => {
    setState((s) => ({
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
    }));
  };

  const changeConditionField = (
    groupId: string,
    conditionId: string,
    fieldKey: SystemFieldKey | "attribute",
    attributeId?: Id<"attributes">,
  ) => {
    setState((s) => ({
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
    }));
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
    if (isNew && onCancelNew) {
      onCancelNew();
      return;
    }
    if (state._id) onDelete(state._id);
  };

  const summary = summarizeRule(state, attributes);

  return (
    <div
      className={cn(
        "transition-colors",
        !isLast && "border-b border-border/40",
      )}
    >
      {/* Row header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="grid w-full grid-cols-[minmax(200px,1.4fr)_1.6fr_1fr_80px] items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              !isExpanded && "-rotate-90",
            )}
          />
          <p className="text-[14px] font-medium truncate">
            {state.title.trim() || "Untitled rule"}
          </p>
        </div>
        <p className="text-[13px] text-muted-foreground truncate">{summary}</p>
        <div>
          <Badge
            variant={state.enabled ? "success" : "outline"}
            className="text-[11px] font-normal w-fit"
          >
            {state.enabled ? "Enabled" : "Draft"}
          </Badge>
        </div>
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {state.stats.matched}
        </span>
      </button>

      {/* Expanded editor */}
      <AnimateHeight expanded={isExpanded}>
        <div className="px-5 pb-5 pt-1 bg-muted/10 border-t border-border/40">
          {/* Title */}
          <div className="mb-5">
            <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
              Rule name
            </label>
            <Input
              value={state.title}
              onChange={(e) =>
                setState((s) => ({ ...s, title: e.target.value }))
              }
              placeholder="e.g. Escalate on high urgency + negative sentiment"
              className="text-[14px] bg-white"
            />
          </div>

          {/* Conditions */}
          <div className="mb-4">
            <label className="text-[12px] font-medium text-muted-foreground mb-2 block">
              Conditions
            </label>
            {state.conditionGroups.length === 0 ? (
              <button
                type="button"
                onClick={addConditionGroup}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-white transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add first condition
              </button>
            ) : (
              <div className="space-y-2.5">
                {state.conditionGroups.map((group, idx) => (
                  <div key={group.id}>
                    {idx > 0 && (
                      <div className="flex items-center gap-2 my-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          OR
                        </span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                    )}
                    <div className="rounded-lg border border-border/70 bg-white overflow-hidden">
                      {group.conditions.map((cond, cidx) => (
                        <div key={cond.id}>
                          {cidx > 0 && (
                            <div className="flex items-center gap-2 px-4 py-1 bg-muted/20">
                              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                                AND
                              </span>
                            </div>
                          )}
                          <ConditionEditor
                            condition={cond}
                            attributes={attributes}
                            onFieldChange={(fieldKey, attrId) =>
                              changeConditionField(group.id, cond.id, fieldKey, attrId)
                            }
                            onChange={(patch) =>
                              updateCondition(group.id, cond.id, patch)
                            }
                            onRemove={() => removeCondition(group.id, cond.id)}
                          />
                        </div>
                      ))}
                      <div className="border-t border-border/40 px-4 py-2 bg-muted/10">
                        <AddConditionMenu
                          onAdd={(fieldKey) => addCondition(group.id, fieldKey)}
                          disabledAttributes={attributes.length === 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addConditionGroup}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[12.5px] text-muted-foreground hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add OR group
                </button>
              </div>
            )}
          </div>

          {/* Validation hint */}
          {!isValid && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
              <AlertTriangle className="h-3.5 w-3.5 mt-[2px] shrink-0" />
              <span>
                Add a name and at least one complete condition before saving.
              </span>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isNew ? "Cancel" : "Delete rule"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnableToggle}
                disabled={!isValid}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full h-8 px-3.5 text-[12.5px] font-medium transition-colors",
                  !isValid
                    ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                    : state.enabled
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer",
                )}
              >
                <Play className="h-3 w-3 fill-current" />
                {state.enabled ? "Disable" : "Enable"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid || !hasChanges}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full h-8 px-3.5 text-[12.5px] font-medium transition-colors",
                  isValid && hasChanges
                    ? "bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed",
                )}
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      </AnimateHeight>
    </div>
  );
}

function AddConditionMenu({
  onAdd,
  disabledAttributes,
}: {
  onAdd: (fieldKey: SystemFieldKey | "attribute") => void;
  disabledAttributes: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[11.5px] text-muted-foreground mr-1">Add:</span>
      <button
        type="button"
        onClick={() => onAdd("attribute")}
        disabled={disabledAttributes}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11.5px] transition-colors",
          disabledAttributes
            ? "text-muted-foreground/40 cursor-not-allowed"
            : "text-foreground hover:bg-muted/60 cursor-pointer",
        )}
      >
        <Plus className="h-3 w-3" />
        Attribute
      </button>
      {ESCALATION_SYSTEM_FIELDS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onAdd(f.key)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11.5px] text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <Plus className="h-3 w-3" />
          {f.label}
        </button>
      ))}
    </div>
  );
}

function ConditionEditor({
  condition,
  attributes,
  onFieldChange,
  onChange,
  onRemove,
}: {
  condition: EscalationConditionDraft;
  attributes: AttributeRef[];
  onFieldChange: (
    fieldKey: SystemFieldKey | "attribute",
    attrId?: Id<"attributes">,
  ) => void;
  onChange: (patch: Partial<EscalationConditionDraft>) => void;
  onRemove: () => void;
}) {
  const attr =
    condition.kind === "attribute"
      ? attributes.find((a) => a._id === condition.attributeId) ?? null
      : null;

  return (
    <div className="flex items-start gap-2 px-4 py-3">
      <div className="flex-1 grid grid-cols-[minmax(160px,1.2fr)_minmax(140px,1fr)_minmax(180px,1.6fr)] gap-2 min-w-0">
        {/* Field */}
        <select
          value={
            condition.kind === "attribute"
              ? `attribute:${condition.attributeId ?? ""}`
              : condition.kind
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith("attribute:")) {
              const id = v.slice("attribute:".length) as Id<"attributes">;
              onFieldChange("attribute", id);
            } else {
              onFieldChange(v as SystemFieldKey);
            }
          }}
          className="h-8 rounded-md border border-border bg-white px-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#e87537]/30 cursor-pointer"
        >
          <optgroup label="Attributes">
            {attributes.length === 0 && (
              <option value="" disabled>
                No enabled attributes
              </option>
            )}
            {attributes.map((a) => (
              <option key={a._id} value={`attribute:${a._id}`}>
                {a.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="System">
            {ESCALATION_SYSTEM_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Operator */}
        <select
          value={condition.operator}
          onChange={(e) => onChange({ operator: e.target.value })}
          className="h-8 rounded-md border border-border bg-white px-2 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#e87537]/30 cursor-pointer"
        >
          {condition.kind === "attribute" ? (
            <>
              <option value="is_any_of">is one of</option>
              <option value="is_none_of">is not one of</option>
            </>
          ) : (
            ESCALATION_SYSTEM_FIELDS.find((f) => f.key === condition.kind)
              ?.operators.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
          )}
        </select>

        {/* Value editor (kind-specific) */}
        {condition.kind === "attribute" ? (
          attr ? (
            <MultiSelect
              options={attr.values.map((v) => ({ value: v.id, label: v.name }))}
              selected={condition.valueIds ?? []}
              onChange={(selected) => onChange({ valueIds: selected })}
              placeholder="Select values..."
            />
          ) : (
            <div className="h-8 rounded-md border border-dashed border-border bg-muted/30 px-2 text-[12px] text-muted-foreground flex items-center">
              Select an attribute
            </div>
          )
        ) : condition.kind === "message_content" ? (
          <Input
            value={condition.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="e.g. lawyer"
            className="h-8 text-[12.5px] bg-white"
          />
        ) : condition.kind === "detected_language" ? (
          <MultiSelect
            options={ESCALATION_LANGUAGES.map((l) => ({ value: l, label: l }))}
            selected={condition.languages ?? []}
            onChange={(selected) => onChange({ languages: selected })}
            placeholder="Select languages..."
          />
        ) : (
          <Input
            type="number"
            min={0}
            value={condition.value ?? 0}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onChange({ value: Number.isFinite(n) ? n : 0 });
            }}
            className="h-8 text-[12.5px] bg-white"
          />
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-1 p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        aria-label="Remove condition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLInputElement | null>>([]);
  const listboxId = useId();

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  const label = useMemo(() => {
    if (selected.length === 0) return placeholder;
    const labels = selected
      .map((v) => options.find((o) => o.value === v)?.label)
      .filter(Boolean);
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
  }, [selected, options, placeholder]);

  useEffect(() => {
    if (!open) return;
    const first = optionRefs.current[focusIndex] ?? optionRefs.current[0];
    first?.focus();
  }, [open, focusIndex]);

  const closeAndFocusButton = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFocusIndex(0);
      setOpen(true);
    }
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeAndFocusButton();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((index + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((index - 1 + options.length) % options.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusIndex(options.length - 1);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          "h-8 w-full rounded-md border border-border bg-white px-2 text-left text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#e87537]/30 cursor-pointer truncate",
          selected.length === 0 && "text-muted-foreground",
        )}
      >
        {label}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[220px] overflow-auto rounded-md border border-border bg-white shadow-lg"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-[12.5px] text-muted-foreground">
                No options
              </div>
            ) : (
              options.map((o, i) => {
                const isSelected = selected.includes(o.value);
                return (
                  <label
                    key={o.value}
                    role="option"
                    aria-selected={isSelected}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12.5px] hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      ref={(el) => {
                        optionRefs.current[i] = el;
                      }}
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(o.value)}
                      onKeyDown={(e) => handleOptionKeyDown(e, i)}
                      className="accent-[#e87537]"
                    />
                    <span className="truncate">{o.label}</span>
                  </label>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function summarizeEscalationRule(
  rule: EscalationRuleDraft,
  attributes: AttributeRef[],
): string {
  return summarizeRule(rule, attributes);
}
