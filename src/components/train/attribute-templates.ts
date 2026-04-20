export type AttributeCategory = "escalation" | "routing" | "filtering" | "custom";

export interface AttributeValueTemplate {
  id: string;
  name: string;
  description: string;
}

export interface AttributeTemplate {
  key: string;
  title: string;
  description: string;
  category: AttributeCategory;
  values: AttributeValueTemplate[];
}

export const ATTRIBUTE_TEMPLATES: AttributeTemplate[] = [
  {
    key: "sentiment",
    title: "Sentiment",
    description: "Detect how happy or frustrated the customer is.",
    category: "escalation",
    values: [
      {
        id: "sentiment_0",
        name: "Positive",
        description:
          "Conversations expressing satisfaction, gratitude, relief, or enthusiasm.",
      },
      {
        id: "sentiment_1",
        name: "Neutral",
        description:
          "Conversations that are factual, procedural, or exploratory without strong emotion.",
      },
      {
        id: "sentiment_2",
        name: "Negative",
        description:
          "Conversations where the customer expresses dissatisfaction, anger, or frustration.",
      },
    ],
  },
  {
    key: "issue_type",
    title: "Issue Type",
    description: "Detect what the customer needs help with.",
    category: "routing",
    values: [
      {
        id: "issue_type_0",
        name: "Billing",
        description:
          "Questions about invoices, charges, payment methods, or refunds.",
      },
      {
        id: "issue_type_1",
        name: "Technical",
        description:
          "Problems with how the product works — errors, outages, bugs, performance.",
      },
      {
        id: "issue_type_2",
        name: "Account",
        description:
          "Questions about sign-in, profile changes, subscriptions, or account access.",
      },
      {
        id: "issue_type_3",
        name: "General inquiry",
        description:
          "Questions about pricing, plans, availability, or how the product works.",
      },
    ],
  },
  {
    key: "urgency",
    title: "Urgency",
    description: "Detect how quickly the customer needs a response.",
    category: "escalation",
    values: [
      {
        id: "urgency_0",
        name: "High",
        description:
          "Customer is blocked, revenue is at risk, or the issue is time-sensitive.",
      },
      {
        id: "urgency_1",
        name: "Medium",
        description:
          "Customer wants a resolution soon but is not completely blocked.",
      },
      {
        id: "urgency_2",
        name: "Low",
        description:
          "General question or feedback with no immediate time pressure.",
      },
    ],
  },
  {
    key: "spam",
    title: "Spam",
    description: "Detect whether the conversation is spam or not.",
    category: "filtering",
    values: [
      {
        id: "spam_0",
        name: "Spam",
        description:
          "Automated messages, promotional content, or irrelevant noise that doesn't need a response.",
      },
      {
        id: "spam_1",
        name: "Legitimate",
        description:
          "Real customer messages with a genuine question or request.",
      },
    ],
  },
  {
    key: "product_area",
    title: "Product Area",
    description: "Detect the part of the product the customer is asking about.",
    category: "routing",
    values: [
      {
        id: "product_area_0",
        name: "Onboarding",
        description: "Sign-up, initial setup, or getting-started questions.",
      },
      {
        id: "product_area_1",
        name: "Core features",
        description: "Questions about primary product functionality and workflows.",
      },
      {
        id: "product_area_2",
        name: "Integrations",
        description: "Questions about connecting third-party tools or APIs.",
      },
      {
        id: "product_area_3",
        name: "Admin",
        description: "Questions about settings, permissions, or team management.",
      },
    ],
  },
  {
    key: "complexity",
    title: "Complexity",
    description: "Detect how complex the customer's query is.",
    category: "escalation",
    values: [
      {
        id: "complexity_0",
        name: "Simple",
        description:
          "A single-step question that can be answered directly from documentation.",
      },
      {
        id: "complexity_1",
        name: "Moderate",
        description:
          "Requires a few steps or some context but can be resolved without deep investigation.",
      },
      {
        id: "complexity_2",
        name: "Complex",
        description:
          "Multi-step investigation, unusual edge case, or requires expertise to resolve.",
      },
    ],
  },
];

export const CATEGORY_LABELS: Record<AttributeCategory, string> = {
  escalation: "ESCALATION",
  routing: "ROUTING",
  filtering: "FILTERING",
  custom: "CUSTOM",
};

export const CATEGORY_COLORS: Record<AttributeCategory, string> = {
  escalation: "text-red-600",
  routing: "text-blue-600",
  filtering: "text-amber-600",
  custom: "text-muted-foreground",
};
