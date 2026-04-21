"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { operatorLabel, type SystemFieldKey } from "@/lib/escalation-system-fields";
import { modeLabel } from "./escalation-meta-selects";
import type {
  EscalationRuleDraft,
  EscalationConditionDraft,
  AttributeRef,
} from "./escalation-rule-editor-primitives";

export {
  narrowDraftCondition,
  emptyConditionGroupDraft,
  type EscalationRuleDraft,
  type EscalationRuleMode,
  type EscalationConditionDraft,
  type EscalationConditionGroupDraft,
  type AttributeRef,
} from "./escalation-rule-editor-primitives";

interface Props {
  rule: EscalationRuleDraft;
  attributes: AttributeRef[];
  isLast: boolean;
  onClick: () => void;
}

function summarizeCondition(
  c: EscalationConditionDraft,
  attributes: AttributeRef[],
): string {
  const fieldLabel = (() => {
    if (c.kind === "attribute") {
      const attr = attributes.find((a) => a._id === c.attributeId);
      return attr?.title ?? "Attribute";
    }
    if (c.kind === "message_content") return "Message";
    if (c.kind === "detected_language") return "Language";
    return "Turn count";
  })();

  const opLabel = operatorLabel(
    c.kind === "attribute" ? "attribute" : (c.kind as SystemFieldKey),
    c.operator,
  );

  return `${fieldLabel} ${opLabel}`.trim();
}

function summarizeRule(rule: EscalationRuleDraft, attributes: AttributeRef[]): string {
  const parts: string[] = [];
  for (const group of rule.conditionGroups) {
    for (const c of group.conditions) {
      parts.push(summarizeCondition(c, attributes));
    }
  }
  if (parts.length === 0) return "No conditions";
  return parts.join(" · ");
}

export function EscalationRuleTableRow({ rule, attributes, isLast, onClick }: Props) {
  const summary = summarizeRule(rule, attributes);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left grid grid-cols-[1fr_80px_60px_80px_80px] items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer",
        !isLast && "border-b border-border",
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-medium truncate">
            {rule.title.trim() || "Untitled"}
          </p>
          <Badge variant="outline" className="shrink-0 !text-[10.5px] !py-0 !px-1.5 !h-[18px]">
            {modeLabel(rule.mode ?? "immediate")}
          </Badge>
        </div>
        <p className="text-[13px] text-muted-foreground line-clamp-1 mt-0.5">
          {summary}
        </p>
      </div>
      <div>
        <Badge variant={rule.enabled ? "success" : "outline"}>
          {rule.enabled ? "Live" : "Draft"}
        </Badge>
      </div>
      <span className="text-[14px] text-muted-foreground">{rule.stats.matched}</span>
      <span className="text-[14px] text-muted-foreground">
        {rule.stats.resolved ?? 0}
      </span>
      <span className="text-[14px] text-muted-foreground">
        {rule.stats.escalated ?? 0}
      </span>
    </button>
  );
}
