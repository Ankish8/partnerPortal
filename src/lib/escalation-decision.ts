import type { EscalationRuleInput } from "./escalation-evaluator";

export type EscalationMode =
  | "immediate"
  | "offer"
  | "ask_more"
  | "never"
  | "none";

export type EscalationTriggeredBy = "baseline" | "rule" | "guidance";

export const BASELINE_TRIGGERS = [
  "direct_human_request",
  "anger_frustration",
  "repetition_loop",
  "first_turn_escalation",
  "keyword_agent_support",
  "how_to_contact",
] as const;

export type BaselineTrigger = (typeof BASELINE_TRIGGERS)[number];

const BASELINE_TRIGGER_SET: ReadonlySet<string> = new Set(BASELINE_TRIGGERS);

export function isBaselineTrigger(value: string): value is BaselineTrigger {
  return BASELINE_TRIGGER_SET.has(value);
}

export type EscalationSource =
  | "baseline"
  | "rule"
  | "guidance"
  | "offer_accepted";

export interface GuidanceChoice {
  _id?: string;
  title: string;
  mode: "immediate" | "offer" | "ask_more" | "never";
}

export interface RuleChoice extends EscalationRuleInput {
  mode: "immediate" | "offer";
}

export interface DecisionInput {
  matchedRules: RuleChoice[];
  llmEscalate: boolean;
  llmEscalationReason: string | null;
  chosenGuidance: GuidanceChoice | null;
  baselineTriggers: BaselineTrigger[];
}

export interface EscalationDecision {
  mode: EscalationMode;
  triggeredBy: EscalationTriggeredBy | null;
  reason: string | null;
  ruleIds: string[];
  ruleTitles: string[];
  guidanceId: string | null;
  baselineTriggers: BaselineTrigger[];
  topBaselineTrigger: BaselineTrigger | null;
}

const BASELINE_REASON_LABELS: Record<BaselineTrigger, string> = {
  direct_human_request: "Customer directly asked for a human",
  anger_frustration: "Customer expressed frustration",
  repetition_loop: "Conversation is looping without progress",
  first_turn_escalation: "Customer opened with an escalation request",
  keyword_agent_support: "Customer asked to talk to agent or support",
  how_to_contact: "Customer asked how to contact support",
};

export function resolveEscalationDecision(
  input: DecisionInput,
): EscalationDecision {
  const {
    matchedRules,
    llmEscalate,
    llmEscalationReason,
    chosenGuidance,
    baselineTriggers,
  } = input;

  const hasDirectHumanRequest = baselineTriggers.includes(
    "direct_human_request",
  );

  // 1. Direct human request always wins → immediate
  if (hasDirectHumanRequest) {
    return {
      mode: "immediate",
      triggeredBy: "baseline",
      reason: BASELINE_REASON_LABELS.direct_human_request,
      ruleIds: [],
      ruleTitles: [],
      guidanceId: null,
      baselineTriggers,
      topBaselineTrigger: "direct_human_request",
    };
  }

  // 2. Matched rule — use rule's mode
  if (matchedRules.length > 0) {
    const mode = matchedRules[0].mode ?? "immediate";
    const titles = matchedRules.map((r) => r.title || "Untitled rule");
    return {
      mode,
      triggeredBy: "rule",
      reason: `Matched rule${matchedRules.length === 1 ? "" : "s"}: ${titles.join(", ")}`,
      ruleIds: matchedRules.map((r) => r._id),
      ruleTitles: titles,
      guidanceId: null,
      baselineTriggers,
      topBaselineTrigger: null,
    };
  }

  // 3. LLM chose a guidance — use guidance's mode
  if (llmEscalate && chosenGuidance) {
    return {
      mode: chosenGuidance.mode,
      triggeredBy: "guidance",
      reason:
        llmEscalationReason && llmEscalationReason.length > 0
          ? llmEscalationReason
          : `Matched guidance: ${chosenGuidance.title}`,
      ruleIds: [],
      ruleTitles: [],
      guidanceId: chosenGuidance._id ?? null,
      baselineTriggers,
      topBaselineTrigger: null,
    };
  }

  // 4. Other baseline triggers → offer
  const otherBaseline = baselineTriggers.find(
    (t) => t !== "direct_human_request",
  );
  if (otherBaseline) {
    return {
      mode: "offer",
      triggeredBy: "baseline",
      reason: BASELINE_REASON_LABELS[otherBaseline],
      ruleIds: [],
      ruleTitles: [],
      guidanceId: null,
      baselineTriggers,
      topBaselineTrigger: otherBaseline,
    };
  }

  // 5. No escalation
  return {
    mode: "none",
    triggeredBy: null,
    reason: null,
    ruleIds: [],
    ruleTitles: [],
    guidanceId: null,
    baselineTriggers,
    topBaselineTrigger: null,
  };
}

export function baselineReasonLabel(trigger: BaselineTrigger): string {
  return BASELINE_REASON_LABELS[trigger];
}

export function decisionSourceForAnalytics(
  decision: EscalationDecision,
  offerAccepted: boolean,
): EscalationSource | null {
  if (offerAccepted) return "offer_accepted";
  if (decision.triggeredBy === "baseline") return "baseline";
  if (decision.triggeredBy === "rule") return "rule";
  if (decision.triggeredBy === "guidance") return "guidance";
  return null;
}
