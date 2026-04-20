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
    description:
      "Captures the overall emotional tone of a customer's message or thread. It reflects how the customer feels based on wording, emphasis, and context across turns. Sentiment helps characterize attitude but doesn't imply topic or urgency.",
    category: "escalation",
    values: [
      {
        id: "sentiment_0",
        name: "Negative",
        description:
          "Conversations where the customer expresses dissatisfaction, anger, disappointment, or loss of trust. Language often includes intensifiers, all-caps, exclamation marks, or sarcasm; may reference prior failures, unmet promises, or threats to cancel or leave. Mentions of refunds, poor quality, delays, or rude treatment are common. Tone leans critical or accusatory and focuses on harms or inconveniences. This value also includes reports of repeated issues and comparisons that portray competitors or past experiences as better.\n\nCommon examples include: Refund demands, Overcharges, Outages or downtime, Rude service reports, Missed SLAs\n\nCommon questions include: Why is this still broken?, When do I get my refund?, Who can fix this now?\n\nKeywords: unhappy, frustrated, refund, angry, broken, slow, complaint",
      },
      {
        id: "sentiment_1",
        name: "Neutral",
        description:
          "Conversations that are factual, procedural, or exploratory without strong emotion. Messages focus on status, confirmation, or context sharing, tone is steady and concise. Typical content includes order numbers, ticket references, reproduction steps, or policy checks. The customer may be evaluating options or documenting observations. Punctuation and wording avoid praise or blame. Dialogue can pivot positive or negative based on new information, but the current message remains even-tempered and information-oriented.\n\nCommon examples include: ETA checks, Plan confirmations, Policy clarifications, Doc requests, API limit notes\n\nCommon questions include: Can you confirm?, Where's the guide?, What's the status?\n\nKeywords: check, confirm, status, update, verify, follow-up, details",
      },
      {
        id: "sentiment_2",
        name: "Positive",
        description:
          "Conversations expressing satisfaction, gratitude, relief, or enthusiasm. Language includes praise, thanks, and acknowledgment of value realized, may follow a successful fix, onboarding milestone, or helpful guidance. Customers might highlight speed, friendliness, or ease of use, and sometimes recommend the product to peers. Emojis or exclamation marks appear as excitement rather than frustration. Messages sometimes include intent to renew, expand usage, or try additional features as a result of a good experience.\n\nCommon examples include: Praise for support, Feature appreciation, Smooth onboarding, Fast resolution, Value realized\n\nCommon questions include: How can I leave a review?, Where can I learn more?, Can I upgrade?\n\nKeywords: thanks, appreciate, love, great, excellent, happy, smooth",
      },
    ],
  },
  {
    key: "issue_type",
    title: "Issue Type",
    description:
      "Identifies the primary purpose of the conversation. Type focuses on intent, not tone or importance, and should reflect the single most dominant objective expressed by the customer during the conversation.",
    category: "routing",
    values: [
      {
        id: "issue_type_0",
        name: "Complaint",
        description:
          "Messages reporting a problem, unfair outcome, or negative experience with an expectation that it be addressed. Content often references defective behavior, incorrect charges, missed deadlines, misleading UI, or policy conflicts. The customer may include evidence such as screenshots, logs, or timeline notes, and can cite prior attempts or case numbers. Tone ranges from firm to angry and typically requests accountability, correction, or compensation. The focus is on what went wrong and the impact on the customer or their business.\n\nCommon examples include: Double charges, Shipping failures, Broken features, Misleading UI, Poor communication\n\nCommon questions include: How do I escalate?, Who's responsible?, What compensation applies?\n\nKeywords: issue, wrong, not working, unacceptable, escalation, formal complaint",
      },
      {
        id: "issue_type_1",
        name: "Request",
        description:
          "Messages that ask for an action, change, or access. They specify what should be added, enabled, or modified, sometimes including deadlines, approvals, or acceptance criteria. Examples include adding seats, enabling integrations, updating ownership, extending trials, or issuing quotes. The customer may supply identifiers (emails, IDs) and context about desired outcomes. Tone is purposeful and forward-looking, oriented around achieving a concrete change rather than learning background information.\n\nCommon examples include: Enable SSO, Add seats, Change account owner, Extend trial, Whitelist IPs\n\nCommon questions include: Can you enable X?, Please update Y, Could you extend Z?\n\nKeywords: add, enable, change, provision, grant, approve, request",
      },
      {
        id: "issue_type_2",
        name: "Question",
        description:
          "Messages that seek information or clarification. The customer is exploring how something works, what limits apply, or which option fits their need. Typical areas include pricing, compatibility, data handling, roadmap signals, or setup steps. Language includes interrogatives and conditional phrasing, with little emphasis on emotion. The message may mention hypothetical scenarios or edge cases to gauge expected behavior before taking action or making a purchase decision.\n\nCommon examples include: Pricing tiers, Compatibility checks, Data residency, Limits and quotas, Setup steps\n\nCommon questions include: How does X work?, What happens if...?, Where do I find...?\n\nKeywords: how, why, what, when, where, can I, clarify",
      },
      {
        id: "issue_type_3",
        name: "Help",
        description:
          "Messages indicating the customer is stuck and needs guidance, troubleshooting steps, or a walkthrough to reach an outcome. Content often includes errors, unexpected results, or uncertainty about which setting, API call, or workflow to use. The customer may provide device details, logs, versions, or screenshots and ask where things went wrong. Tone is candid and problem-solving oriented, focused on unblocking progress rather than requesting new features or reporting general dissatisfaction.\n\nCommon examples include: Login issues, 2FA failures, Webhook 500s, CSV import errors, SDK setup blocks\n\nCommon questions include: Can you walk me through this?, What's the fix?, Where did this fail?\n\nKeywords: help, assist, support, stuck, error, fix, walkthrough",
      },
    ],
  },
  {
    key: "urgency",
    title: "Urgency",
    description:
      "Indicates how time-sensitive the conversation is and the degree of immediate impact on the customer. Urgency is independent of sentiment and topic, a calm message may still be urgent, and an angry one may not be time-critical.",
    category: "escalation",
    values: [
      {
        id: "urgency_0",
        name: "High",
        description:
          "Time-sensitive conversations where the customer is blocked from critical work or facing significant risk. Language signals immediacy (ASAP, today, now) and may reference deadlines, executive visibility, incidents, or contractual commitments. Examples include production outages, access loss before a demo, billing lockouts stopping operations, or suspected security issues. The message emphasizes impact and time pressure, with expectations of swift updates and near-term resolution to restore functionality or mitigate damage.\n\nCommon examples include: Production outage, Login blocked before demo, Billing lockout, Security concern\n\nCommon questions include: Can someone call me now?, What's the ETA today?, Who is on this?\n\nKeywords: urgent, critical, ASAP, blocked, outage, P1, today",
      },
      {
        id: "urgency_1",
        name: "Medium",
        description:
          "Conversations that matter to the customer but are not service-blocking. A near-term deadline exists, often linked to a sprint boundary, reporting cycle, or scheduled event, but operations continue. The customer wants progress within days, with clarity on sequence and timing. Typical items include enabling a feature this week, migrating configurations by a stated date, or correcting an invoice before month-end. Language mentions specific dates or time windows without the intensity of an emergency.\n\nCommon examples include: Enable feature this week, Migrate by stated date, Correct invoice before month-end\n\nCommon questions include: Can we get this by Friday?, What's the timeline?, Any update this week?\n\nKeywords: soon, priority, this week, by Friday, timeline, follow-up",
      },
      {
        id: "urgency_2",
        name: "Low",
        description:
          "Conversations with flexible timing and minimal immediate impact. The customer is exploring ideas, suggesting improvements, or gathering background for future plans. Outcomes are valuable but not urgent, and there is no blocking deadline. Examples include best-practice questions, UI polish suggestions, feature curiosity, or research into long-term integrations. Language includes phrases like \"when convenient\" or \"no rush,\" indicating openness to asynchronous progress and batching with other work.\n\nCommon examples include: Best-practice questions, UI suggestions, Feature curiosity, Long-term research\n\nCommon questions include: When convenient, could you...?, No rush, just checking, Can you look into this later?\n\nKeywords: whenever, no rush, later, nice-to-have, explore, backlog",
      },
    ],
  },
  {
    key: "spam",
    title: "Spam",
    description:
      "Flags content that is unsolicited, deceptive, or unrelated to legitimate product use. This includes promotions, phishing, malware, mass marketing, or messages lacking a genuine customer need. Spam is distinct from legitimate but negative feedback.",
    category: "filtering",
    values: [
      {
        id: "spam_0",
        name: "Yes",
        description:
          "Unsolicited or irrelevant content unrelated to legitimate customer needs. Typical patterns include mass marketing blasts, phishing attempts, malware links, pyramid or investment schemes, fake invoices, adult material, or SEO solicitations. Signals may include suspicious domains, mismatched branding, unusual attachments, evasive wording, or exaggerated claims. Messages often try to create false urgency or request credentials or payments without context connecting to the product or account.\n\nCommon examples include: Crypto schemes, Fake invoices, SEO cold emails, Adult content, Random attachments\n\nKeywords: promotion, lottery, giveaway, investment, click here, verify now, $$$",
      },
      {
        id: "spam_1",
        name: "No",
        description:
          "Authentic customer communications connected to a real account or need. Messages may be brief, off-template, or forwarded from another channel but still relate to orders, access, billing, or product use. The presence of identifiers, prior correspondence, or concrete context supports legitimacy. Tone varies widely, from terse to enthusiastic, but the content aligns with normal support, sales, or success workflows rather than unsolicited promotion or deception.\n\nCommon examples include: Status pings, Forwarded receipts, Internal referrals, New-to-product inquiries\n\nCommon questions include: Is this the right team?, Can you help with this?, Who owns this case?\n\nKeywords: account, order, invoice, subscription, access, support",
      },
    ],
  },
  {
    key: "product_area",
    title: "Product Area",
    description:
      "Maps the conversation to the relevant functional domain of the product or service. This classification anchors the topic so it can be routed to the right expertise, aligned with documentation, and analyzed alongside similar issues or requests.",
    category: "routing",
    values: [
      {
        id: "product_area_0",
        name: "Billing",
        description:
          "Conversations about charges, invoices, subscriptions, renewals, discounts, payment methods, taxes, and proration. Topics include failed or expired cards, duplicate charges, credits, refunds, quotes, purchase orders, and VAT/GST requirements. Customers may request receipts, tax IDs, or plan changes and ask how pricing applies across tiers or regions. Evidence such as invoice numbers or screenshots is common, along with concerns about compliance and the financial impact of issues.\n\nCommon examples include: Duplicate charge, Invoice copy, Tax ID update, Plan change, Credit or refund\n\nCommon questions include: Why was I charged?, Can I get a receipt?, How do I change plans?\n\nKeywords: invoice, charge, refund, receipt, subscription, proration, tax, card",
      },
      {
        id: "product_area_1",
        name: "Permissions",
        description:
          "Conversations concerning roles, access control, authentication, and identity. Areas include invites, role assignment, admin transfer, MFA requirements, SSO/SAML setup, SCIM provisioning, audit needs, and login restrictions. Customers may describe who should have which capabilities and reference security or compliance standards. Indicators include access errors, ownership changes, or requests to restrict visibility of sensitive data to specific groups or tenants.\n\nCommon examples include: Grant analyst role, Transfer ownership, Enforce MFA, SCIM sync issues, SSO setup\n\nCommon questions include: Who can access X?, How do I add or remove users?, Can we restrict Y?\n\nKeywords: access, role, permission, admin, login, SSO, SAML, SCIM, MFA",
      },
      {
        id: "product_area_2",
        name: "Data",
        description:
          "Conversations about data handling, movement, and governance. Topics include imports and exports, reporting accuracy, analytics, backups, retention, residency, privacy requests, schema changes, and API data flows. Customers might ask about supported formats, volumes, and SLAs, reference warehouses or BI tools, or seek redaction and deletion for compliance (e.g., GDPR/CCPA). Messages often include file samples, column mappings, and expectations for consistency across systems.\n\nCommon examples include: CSV import mapping, Export to warehouse, Delete data, Region move, Report accuracy\n\nCommon questions include: Where is data stored?, How do I export?, What is retained?\n\nKeywords: data, export, import, report, analytics, privacy, retention, residency, GDPR",
      },
    ],
  },
  {
    key: "complexity",
    title: "Complexity",
    description:
      "Estimates the level of effort and coordination required to resolve the conversation. Complexity could stem from the complexity of the customers issue, or from the solution required to solve it.",
    category: "escalation",
    values: [
      {
        id: "complexity_0",
        name: "High",
        description:
          "Conversations that involve multi-step work, cross-team coordination, or deep investigation with uncertain root cause. Scenarios include systemic performance problems, complex identity interactions, data repair or merge efforts, bespoke integrations, or environment-specific behavior. The path to resolution may require logs, repro steps, and phased changes across components. Timeframes and outcomes are less predictable, and the solution can depend on constraints unique to the customer.\n\nCommon examples include: Systemic performance issues, Complex IdP interactions, Data repair or merge, Custom integrations\n\nCommon questions include: What's the root cause?, Who needs to be involved?, What's the rollback plan?\n\nKeywords: complex, escalation, cross-team, custom, investigation, RCA",
      },
      {
        id: "complexity_1",
        name: "Medium",
        description:
          "Conversations requiring standard troubleshooting or configuration with some analysis. Known patterns or runbooks usually apply, but adaptation may be needed for context or edge cases. Examples include webhook retries, SSO mapping quirks, plan migration with exceptions, or partial feature outages. The customer expects resolution within a reasonable window, and the work involves verifying settings, reproducing behavior, and coordinating moderate changes or follow-ups.\n\nCommon examples include: Webhook retries, SSO mapping quirks, Plan migration with exceptions, Partial outages\n\nCommon questions include: What steps should I try?, Any risks to consider?, How long might this take?\n\nKeywords: troubleshoot, configure, follow-up, moderate, runbook, partial fix",
      },
      {
        id: "complexity_2",
        name: "Low",
        description:
          "Conversations resolved with straightforward steps and predictable outcomes. These typically match documented how-tos or templates and can be completed quickly. Common items include password reset guidance, sending a copy of an invoice, adding a user, updating profile details, clarifying a basic setting, or linking to a help article. Risks and dependencies are minimal, and success criteria are clear from the initial message without extensive investigation.\n\nCommon examples include: Password reset steps, Send invoice copy, Add a user, Update profile details, Basic how-to\n\nCommon questions include: Where is the setting?, Which button should I use?, Can you send the link?\n\nKeywords: simple, quick, basic, FAQ, standard, routine, template",
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
