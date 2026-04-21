"use client";

import { useState } from "react";
import {
  ChevronDown,
  Plus,
  Check,
  X,
  Tag,
  MessageSquare,
  Languages,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ESCALATION_LANGUAGES,
  ESCALATION_SYSTEM_FIELDS,
  type SystemFieldKey,
  operatorLabel,
} from "@/lib/escalation-system-fields";
import type { EscalationCondition } from "@/lib/escalation-evaluator";

export function nanoid(): string {
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

export type EscalationRuleMode = "immediate" | "offer";

export interface EscalationRuleDraft {
  _id?: Id<"escalationRules">;
  title: string;
  enabled: boolean;
  mode: EscalationRuleMode;
  audience: string;
  channels: string;
  conditionGroups: EscalationConditionGroupDraft[];
  stats: { matched: number; resolved?: number; escalated?: number };
}

export interface AttributeRef {
  _id: Id<"attributes">;
  title: string;
  values: { id: string; name: string }[];
}

export function emptyConditionForField(
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
      operator: c.operator as "is_any_of" | "is_none_of" | "has_any_value",
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

function ConditionFieldIcon({
  kind,
  className,
}: {
  kind: EscalationConditionDraft["kind"];
  className?: string;
}) {
  switch (kind) {
    case "attribute":
      return <Tag className={className} />;
    case "message_content":
      return <MessageSquare className={className} />;
    case "detected_language":
      return <Languages className={className} />;
    case "turn_count":
      return <Hash className={className} />;
  }
}

function conditionFieldLabel(
  c: EscalationConditionDraft,
  attributes: AttributeRef[],
): string {
  if (c.kind === "attribute") {
    const attr = attributes.find((a) => a._id === c.attributeId);
    return attr?.title ?? "Attribute";
  }
  if (c.kind === "message_content") return "Message";
  if (c.kind === "detected_language") return "Language";
  return "Turn count";
}

function conditionValueLabel(
  c: EscalationConditionDraft,
  attributes: AttributeRef[],
): string {
  if (c.kind === "attribute") {
    if (c.operator === "has_any_value") return "";
    const attr = attributes.find((a) => a._id === c.attributeId);
    if (!attr) return "—";
    const names = (c.valueIds ?? [])
      .map((id) => attr.values.find((v) => v.id === id)?.name)
      .filter(Boolean) as string[];
    if (names.length === 0) return "—";
    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(", ");
    return `${names[0]}, ${names[1]} +${names.length - 2}`;
  }
  if (c.kind === "message_content") {
    const t = (c.text ?? "").trim();
    if (!t) return "—";
    return `"${t.length > 20 ? `${t.slice(0, 20)}…` : t}"`;
  }
  if (c.kind === "detected_language") {
    const langs = c.languages ?? [];
    if (langs.length === 0) return "—";
    if (langs.length <= 2) return langs.join(", ");
    return `${langs.slice(0, 2).join(", ")} +${langs.length - 2}`;
  }
  return String(c.value ?? 0);
}

export function isConditionComplete(c: EscalationConditionDraft): boolean {
  if (c.kind === "attribute") {
    if (!c.attributeId) return false;
    if (c.operator === "has_any_value") return true;
    return !!(c.valueIds && c.valueIds.length > 0);
  }
  if (c.kind === "message_content") return !!c.text?.trim();
  if (c.kind === "detected_language")
    return !!(c.languages && c.languages.length > 0);
  if (c.kind === "turn_count")
    return c.value !== undefined && Number.isFinite(c.value);
  return false;
}

export function ConditionPill({
  condition,
  attributes,
  groupIndex,
  onChangeKind,
  onUpdate,
  onRemove,
}: {
  condition: EscalationConditionDraft;
  attributes: AttributeRef[];
  groupIndex: number;
  onChangeKind: (
    fieldKey: SystemFieldKey | "attribute",
    attrId?: Id<"attributes">,
  ) => void;
  onUpdate: (patch: Partial<EscalationConditionDraft>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const fieldLabel = conditionFieldLabel(condition, attributes);
  const opLabel = operatorLabel(
    condition.kind === "attribute" ? "attribute" : (condition.kind as SystemFieldKey),
    condition.operator,
  );
  const valueLabel = conditionValueLabel(condition, attributes);
  const complete = isConditionComplete(condition);

  const palette = [
    { bg: "bg-white", border: "border-border", text: "text-foreground", accent: "text-muted-foreground" },
    { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-900", accent: "text-rose-700/70" },
    { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-900", accent: "text-sky-700/70" },
    { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", accent: "text-amber-700/70" },
    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", accent: "text-emerald-700/70" },
  ];
  const color = palette[groupIndex % palette.length];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border pl-2.5 pr-1 py-1 text-[12.5px] transition-colors max-w-full",
        color.bg,
        color.border,
        complete ? color.text : "text-muted-foreground italic",
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 outline-none cursor-pointer hover:brightness-[0.98]"
            />
          }
        >
          <ConditionFieldIcon
            kind={condition.kind}
            className={cn("h-3.5 w-3.5 shrink-0", color.accent)}
          />
          <span className="font-medium truncate max-w-[160px]">{fieldLabel}</span>
          <span className={cn("shrink-0", color.accent)}>{opLabel}</span>
          {valueLabel && (
            <span className="font-medium truncate max-w-[160px]">{valueLabel}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[320px] space-y-3" sideOffset={8}>
          <ConditionEditor
            condition={condition}
            attributes={attributes}
            onChangeKind={onChangeKind}
            onUpdate={onUpdate}
          />
          <div className="flex justify-end pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-full bg-[#e87537] hover:bg-[#d16a30] text-white h-8 px-4 text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "ml-1 flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 transition-colors cursor-pointer",
          color.accent,
        )}
        aria-label="Remove condition"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function ConditionEditor({
  condition,
  attributes,
  onChangeKind,
  onUpdate,
}: {
  condition: EscalationConditionDraft;
  attributes: AttributeRef[];
  onChangeKind: (
    fieldKey: SystemFieldKey | "attribute",
    attrId?: Id<"attributes">,
  ) => void;
  onUpdate: (patch: Partial<EscalationConditionDraft>) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-1">Field</p>
        <CustomSelect
          value={
            condition.kind === "attribute"
              ? `attribute:${condition.attributeId ?? ""}`
              : condition.kind
          }
          onChange={(v) => {
            if (v.startsWith("attribute:")) {
              const id = v.slice("attribute:".length) as Id<"attributes">;
              onChangeKind("attribute", id);
            } else {
              onChangeKind(v as SystemFieldKey);
            }
          }}
          options={[
            ...(attributes.length > 0
              ? [
                  {
                    group: "Attributes" as const,
                    options: attributes.map((a) => ({
                      value: `attribute:${a._id}`,
                      label: a.title,
                    })),
                  },
                ]
              : []),
            {
              group: "System" as const,
              options: ESCALATION_SYSTEM_FIELDS.map((f) => ({
                value: f.key,
                label: f.label,
              })),
            },
          ]}
          placeholder="Select field"
        />
      </div>

      <div>
        <p className="text-[11px] font-medium text-muted-foreground mb-1">Condition</p>
        {condition.kind === "attribute" ? (
          <OperatorRadios
            value={condition.operator}
            options={[
              { value: "is_any_of", label: "is" },
              { value: "is_none_of", label: "is not" },
              { value: "has_any_value", label: "has any value" },
            ]}
            onChange={(v) => onUpdate({ operator: v })}
          />
        ) : (
          <CustomSelect
            value={condition.operator}
            onChange={(v) => onUpdate({ operator: v })}
            options={[
              {
                group: null,
                options:
                  ESCALATION_SYSTEM_FIELDS.find((f) => f.key === condition.kind)
                    ?.operators.map((o) => ({ value: o.value, label: o.label })) ?? [],
              },
            ]}
          />
        )}
      </div>

      {condition.kind === "attribute" && condition.operator !== "has_any_value" && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1">Value</p>
          {(() => {
            const attr = attributes.find((a) => a._id === condition.attributeId);
            if (!attr)
              return (
                <p className="text-[12px] text-muted-foreground">
                  Select an attribute first.
                </p>
              );
            return (
              <MultiSelectList
                options={attr.values.map((v) => ({ value: v.id, label: v.name }))}
                selected={condition.valueIds ?? []}
                onChange={(selected) => onUpdate({ valueIds: selected })}
              />
            );
          })()}
        </div>
      )}

      {condition.kind === "message_content" && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1">Text</p>
          <Input
            value={condition.text ?? ""}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="e.g. lawyer"
            className="h-8 text-[12.5px]"
          />
        </div>
      )}

      {condition.kind === "detected_language" && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1">Languages</p>
          <MultiSelectList
            options={ESCALATION_LANGUAGES.map((l) => ({ value: l, label: l }))}
            selected={condition.languages ?? []}
            onChange={(selected) => onUpdate({ languages: selected })}
          />
        </div>
      )}

      {condition.kind === "turn_count" && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1">Turn count</p>
          <Input
            type="number"
            min={0}
            value={condition.value ?? 0}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onUpdate({ value: Number.isFinite(n) ? n : 0 });
            }}
            className="h-8 text-[12.5px]"
          />
        </div>
      )}
    </div>
  );
}

function OperatorRadios({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border",
                selected ? "border-[#e87537]" : "border-border",
              )}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-[#e87537]" />}
            </span>
            <input
              type="radio"
              className="sr-only"
              checked={selected}
              onChange={() => onChange(opt.value)}
            />
            <span className="text-[13px]">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{
    group: string | null;
    options: { value: string; label: string }[];
  }>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const flat = options.flatMap((g) => g.options);
  const selected = flat.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-full items-center justify-between rounded-md border border-border bg-white px-2.5 text-[12.5px] text-left hover:bg-muted/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e87537]/30"
          />
        }
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected?.label ?? placeholder ?? "Select"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] !p-1 min-w-[180px]">
        <div className="max-h-[240px] overflow-auto">
          {options.map((group, gi) => (
            <div key={gi}>
              {group.group && (
                <p className="px-2 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.group}
                </p>
              )}
              {group.options.map((o) => {
                const isSelected = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px] text-left transition-colors cursor-pointer",
                      isSelected ? "bg-muted" : "hover:bg-muted/50",
                    )}
                  >
                    <span className="flex-1 truncate">{o.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#e87537]" />}
                  </button>
                );
              })}
            </div>
          ))}
          {flat.length === 0 && (
            <p className="px-2 py-2 text-[12.5px] text-muted-foreground">No options</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectList({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(
      selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v],
    );
  };
  return (
    <div className="max-h-[180px] overflow-auto rounded-md border border-border">
      {options.length === 0 ? (
        <p className="px-2.5 py-2 text-[12.5px] text-muted-foreground">No options</p>
      ) : (
        options.map((o) => {
          const isSelected = selected.includes(o.value);
          return (
            <label
              key={o.value}
              className="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] hover:bg-muted/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(o.value)}
                className="h-3.5 w-3.5 accent-[#e87537] cursor-pointer"
              />
              <span className="truncate">{o.label}</span>
            </label>
          );
        })
      )}
    </div>
  );
}

export function AddInlineButton({
  onClick,
  tooltip,
}: {
  onClick: () => void;
  tooltip: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
            aria-label={tooltip}
          />
        }
      >
        <Plus className="h-3 w-3" />
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function GroupConnector({
  value,
  onChange,
}: {
  value: "and" | "or";
  onChange: (v: "and" | "or") => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline decoration-dotted underline-offset-[3px]"
          />
        }
      >
        {value}
      </PopoverTrigger>
      <PopoverContent className="!p-1 min-w-[100px]">
        {(["and", "or"] as const).map((opt) => {
          const isSelected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] transition-colors cursor-pointer",
                isSelected ? "bg-muted" : "hover:bg-muted/50",
              )}
            >
              <span>{opt}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-[#e87537]" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
