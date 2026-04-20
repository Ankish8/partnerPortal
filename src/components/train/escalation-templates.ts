export const ESCALATION_AUDIENCE_OPTIONS = [
  "Everyone",
  "New customers",
  "Returning customers",
  "VIP customers",
];

export const ESCALATION_CHANNEL_OPTIONS = [
  "All channels",
  "WhatsApp",
  "Web chat",
  "Email",
];

export interface EscalationGuidanceSeed {
  title: string;
  content: string;
}

export const ESCALATION_GUIDANCE_SEEDS: EscalationGuidanceSeed[] = [
  {
    title: "Hand off on strong frustration",
    content:
      "If the customer expresses strong dissatisfaction — language like 'angry', 'furious', 'unacceptable', 'file a complaint', 'refund now', or repeated all-caps — acknowledge briefly and hand off to a human agent instead of attempting to resolve.",
  },
  {
    title: "Hand off on legal or compliance topics",
    content:
      "If the customer mentions legal action, lawyers, lawsuits, compliance violations, data breaches, or regulatory concerns (GDPR, CCPA, HIPAA), do not attempt to answer. Briefly acknowledge and hand off to a human who can address these sensitive topics.",
  },
  {
    title: "Hand off when stuck after two attempts",
    content:
      "If the knowledge base does not contain information needed and the customer has asked the same or a closely related question more than twice, stop trying to answer and hand off to a human agent.",
  },
];
