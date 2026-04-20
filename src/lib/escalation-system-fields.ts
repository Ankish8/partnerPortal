export const ESCALATION_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Russian",
  "Hindi",
] as const;

export type EscalationLanguage = (typeof ESCALATION_LANGUAGES)[number];

export type SystemFieldKey = "message_content" | "detected_language" | "turn_count";

export interface SystemFieldDef {
  key: SystemFieldKey;
  label: string;
  description: string;
  operators: Array<{ value: string; label: string }>;
}

export const ESCALATION_SYSTEM_FIELDS: SystemFieldDef[] = [
  {
    key: "message_content",
    label: "Message content",
    description: "Match text in the customer's most recent message.",
    operators: [
      { value: "contains", label: "contains" },
      { value: "not_contains", label: "does not contain" },
    ],
  },
  {
    key: "detected_language",
    label: "Detected language",
    description: "Language detected from the customer's message.",
    operators: [
      { value: "is_any_of", label: "is one of" },
      { value: "is_none_of", label: "is not one of" },
    ],
  },
  {
    key: "turn_count",
    label: "Turn count",
    description: "Number of customer messages in the conversation so far.",
    operators: [
      { value: "gt", label: "greater than" },
      { value: "gte", label: "greater than or equal to" },
      { value: "lt", label: "less than" },
      { value: "lte", label: "less than or equal to" },
      { value: "equals", label: "equals" },
    ],
  },
];

export function systemFieldLabel(key: SystemFieldKey): string {
  return (
    ESCALATION_SYSTEM_FIELDS.find((f) => f.key === key)?.label ?? key
  );
}

export function operatorLabel(
  key: SystemFieldKey | "attribute",
  operator: string,
): string {
  if (key === "attribute") {
    if (operator === "is_any_of") return "is one of";
    if (operator === "is_none_of") return "is not one of";
    return operator;
  }
  const field = ESCALATION_SYSTEM_FIELDS.find((f) => f.key === key);
  return field?.operators.find((o) => o.value === operator)?.label ?? operator;
}
