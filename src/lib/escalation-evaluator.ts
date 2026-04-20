export type EscalationCondition =
  | {
      kind: "attribute";
      id: string;
      attributeId: string;
      operator: "is_any_of" | "is_none_of" | "has_any_value";
      valueIds: string[];
    }
  | {
      kind: "message_content";
      id: string;
      operator: "contains" | "not_contains";
      text: string;
    }
  | {
      kind: "detected_language";
      id: string;
      operator: "is_any_of" | "is_none_of";
      languages: string[];
    }
  | {
      kind: "turn_count";
      id: string;
      operator: "gt" | "gte" | "lt" | "lte" | "equals";
      value: number;
    };

export interface EscalationRuleInput {
  _id: string;
  title: string;
  enabled: boolean;
  conditionGroups: Array<{ id: string; conditions: EscalationCondition[] }>;
}

export interface EscalationContext {
  attributeDetections: Array<{ attributeId: string; valueId: string | null }>;
  messageContent: string;
  detectedLanguage: string;
  turnCount: number;
}

function evaluateCondition(
  c: EscalationCondition,
  ctx: EscalationContext,
): boolean {
  switch (c.kind) {
    case "attribute": {
      const detection = ctx.attributeDetections.find(
        (d) => d.attributeId === c.attributeId,
      );
      const detected = detection?.valueId ?? null;
      if (c.operator === "has_any_value") {
        return detected !== null;
      }
      if (c.operator === "is_any_of") {
        return detected !== null && c.valueIds.includes(detected);
      }
      return detected === null || !c.valueIds.includes(detected);
    }
    case "message_content": {
      const needle = c.text.toLowerCase().trim();
      if (needle === "") return false;
      const haystack = ctx.messageContent.toLowerCase();
      const has = haystack.includes(needle);
      return c.operator === "contains" ? has : !has;
    }
    case "detected_language": {
      if (c.languages.length === 0) return false;
      const match = c.languages.includes(ctx.detectedLanguage);
      return c.operator === "is_any_of" ? match : !match;
    }
    case "turn_count": {
      const n = ctx.turnCount;
      switch (c.operator) {
        case "gt":
          return n > c.value;
        case "gte":
          return n >= c.value;
        case "lt":
          return n < c.value;
        case "lte":
          return n <= c.value;
        case "equals":
          return n === c.value;
      }
    }
  }
}

function evaluateRule(
  rule: EscalationRuleInput,
  ctx: EscalationContext,
): boolean {
  if (rule.conditionGroups.length === 0) return false;
  return rule.conditionGroups.some((group) => {
    if (group.conditions.length === 0) return false;
    return group.conditions.every((c) => evaluateCondition(c, ctx));
  });
}

export function evaluateEscalationRules(
  rules: EscalationRuleInput[],
  ctx: EscalationContext,
): { matched: EscalationRuleInput[] } {
  return {
    matched: rules.filter((r) => r.enabled && evaluateRule(r, ctx)),
  };
}

export interface DetectedLanguage {
  language: string;
  confident: boolean;
}

export function detectLanguage(text: string): DetectedLanguage {
  const trimmed = text.trim();
  if (!trimmed) return { language: "English", confident: false };
  if (/[\u4e00-\u9fff]/.test(trimmed)) return { language: "Chinese", confident: true };
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(trimmed)) return { language: "Japanese", confident: true };
  if (/[\uac00-\ud7af]/.test(trimmed)) return { language: "Korean", confident: true };
  if (/[\u0600-\u06ff]/.test(trimmed)) return { language: "Arabic", confident: true };
  if (/[\u0400-\u04ff]/.test(trimmed)) return { language: "Russian", confident: true };
  if (/[\u0900-\u097f]/.test(trimmed)) return { language: "Hindi", confident: true };
  const lower = trimmed.toLowerCase();
  const patterns: Record<string, RegExp> = {
    Spanish:
      /\b(el|la|los|las|de|un|una|y|que|es|con|por|para|pero|cómo|dónde|más)\b/g,
    French:
      /\b(le|la|les|de|du|et|que|est|dans|pour|avec|comment|où|plus|très|mais)\b/g,
    German: /\b(der|die|das|ein|und|ist|zu|mit|für|ich|nicht|wie|wo)\b/g,
    Portuguese:
      /\b(o|a|os|as|um|uma|do|da|que|é|em|com|por|para|como|onde|mais)\b/g,
  };
  let best = { language: "English", score: 0 };
  for (const [language, re] of Object.entries(patterns)) {
    const score = (lower.match(re) || []).length;
    if (score > best.score) best = { language, score };
  }
  const confident = trimmed.length >= 10;
  if (best.score >= 2) return { language: best.language, confident };
  return { language: "English", confident };
}

export function detectLanguageHeuristic(text: string): string {
  return detectLanguage(text).language;
}
