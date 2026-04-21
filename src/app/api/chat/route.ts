import { NextRequest } from "next/server";
import { fetchAction, fetchMutation, fetchQuery } from "convex/nextjs";
import { parse as parsePartial, Allow } from "partial-json";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  evaluateEscalationRules,
  evaluateRulesPreLLM,
  detectLanguageHeuristic,
  type EscalationRuleInput,
} from "@/lib/escalation-evaluator";
import {
  resolveEscalationDecision,
  decisionSourceForAnalytics,
  BASELINE_TRIGGERS,
  isBaselineTrigger,
  type BaselineTrigger,
  type EscalationMode,
  type EscalationTriggeredBy,
  type RuleChoice,
  type GuidanceChoice,
} from "@/lib/escalation-decision";

type OfferResponseKind = "accepted" | "declined" | "unclear" | "not_applicable";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface GuidanceRule {
  title: string;
  content: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Personality {
  tone?: string;
  length?: string;
}

interface Source {
  id: number;
  entryId: string;
  title: string;
  url: string;
  snippet: string;
  content: string;
}

interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
}

interface AttributeValueSpec {
  id: string;
  name: string;
  description: string;
}

interface AttributeConditionSpec {
  id: string;
  ifAttributeId: string;
  ifValueId: string;
  useValueIds: string[];
}

interface AttributeSpec {
  id: string;
  title: string;
  description: string;
  values: AttributeValueSpec[];
  conditions?: AttributeConditionSpec[];
}

interface AttributeDetection {
  attributeId: string;
  attributeTitle: string;
  valueId: string | null;
  valueName: string | null;
}

interface EscalationGuidanceSpec {
  _id?: string;
  title: string;
  content: string;
  mode?: "immediate" | "offer" | "ask_more" | "never";
}

type StreamEvent =
  | { type: "delta"; text: string }
  | {
      type: "done";
      followUp: string;
      citations: Citation[];
      guidanceApplied: string[];
      rulesApplied: number;
      knowledgePagesAvailable: number;
      latencyMs: number;
      attributeDetections: AttributeDetection[];
      conversationId: string | null;
      escalate: boolean;
      escalationReason: string | null;
      escalationTriggeredBy: EscalationTriggeredBy | null;
      escalationRuleTitles: string[];
      decisionMode: EscalationMode;
      baselineTriggers: BaselineTrigger[];
      topBaselineTrigger: BaselineTrigger | null;
      offerSuggestedReplies: string[];
      offerAcknowledged: "accepted" | "declined" | null;
      forcedByDoubleOffer: boolean;
    }
  | { type: "error"; message: string };

const TONE_INSTRUCTIONS: Record<string, string> = {
  Friendly:
    "warm, approachable, and conversational. Use contractions, friendly greetings, and a welcoming feel.",
  Neutral: "balanced, clear, and direct. Neither overly warm nor formal.",
  "Matter-of-fact":
    "plain-spoken and objective. State information without embellishment or filler.",
  Professional:
    "polished, formal, and precise. Avoid slang or casual expressions.",
  Humorous:
    "light-hearted and playful when appropriate while staying helpful and accurate.",
};

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  Concise:
    "Short and tight. For list-style answers (plans, prices, options, features), use a bulleted list with each item's **bold name** followed by at most one key detail or number — no extra context. For single-fact answers, use one short sentence of prose.",
  Standard:
    "Balanced detail. For list-style answers, use a bulleted list with each item's **bold name** followed by one sentence of key details. For single-fact answers, use two to four sentences.",
  Thorough:
    "Detailed and comprehensive. For list-style answers, use a bulleted list with each item's **bold name** followed by two to three sentences covering details, context, and examples. Anticipate related follow-ups.",
};

function buildKnowledgeSection(sources: Source[]): string {
  if (sources.length === 0) return "";
  const blocks = sources.map((s) => {
    const header = [
      `[^${s.id}] ${s.title || "Untitled source"}`,
      s.url ? `URL: ${s.url}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return `${header}\n\n${s.content}`;
  });
  return blocks.join("\n\n---\n\n");
}

function buildAttributeSection(attributes: AttributeSpec[]): string {
  if (attributes.length === 0) return "";
  const attrById = new Map(attributes.map((a) => [a.id, a]));
  const blocks = attributes.map((a) => {
    const valueLines = a.values
      .map((v) => `    - id: "${v.id}" — ${v.name}: ${v.description}`)
      .join("\n");

    const lines = [
      `- Attribute id: "${a.id}"`,
      `  Title: ${a.title}`,
      `  Purpose: ${a.description}`,
      `  Allowed values:`,
      valueLines,
    ];

    const conditions = a.conditions ?? [];
    if (conditions.length > 0) {
      const conditionLines: string[] = [];
      for (const c of conditions) {
        const controlling = attrById.get(c.ifAttributeId);
        if (!controlling) continue;
        const ifValue = controlling.values.find((v) => v.id === c.ifValueId);
        if (!ifValue) continue;
        const allowedValues = a.values.filter((v) =>
          c.useValueIds.includes(v.id),
        );
        if (allowedValues.length === 0) continue;
        const allowedList = allowedValues
          .map((v) => `"${v.id}" (${v.name})`)
          .join(", ");
        conditionLines.push(
          `    - Only detect this attribute when attribute "${controlling.title}" is detected as "${ifValue.name}". When that condition holds, restrict the chosen value id to: [${allowedList}]. Otherwise select null.`,
        );
      }
      if (conditionLines.length > 0) {
        lines.push("  Conditional rules (apply BEFORE picking a value):");
        lines.push(...conditionLines);
      }
    }

    return lines.join("\n");
  });
  return [
    "=== ATTRIBUTE DETECTION ===",
    "For each attribute below, examine the customer's LATEST message and select the single best-matching value id from that attribute's allowed values, or null if no value applies with reasonable confidence.",
    "- Base the decision on the latest user message in context of the conversation so far.",
    "- Use ONLY the value ids listed for each attribute — never invent ids.",
    "- Prefer null over guessing when the message is ambiguous for that attribute.",
    "- When an attribute has Conditional rules, evaluate them using the SAME attributeDetections you are producing in this response — keep the detections self-consistent. If the controlling condition does not hold, select null for the dependent attribute.",
    "",
    blocks.join("\n\n"),
    "=== END ATTRIBUTE DETECTION ===",
  ].join("\n");
}

function buildEscalationSection(
  escalationGuidance: EscalationGuidanceSpec[],
  previousWasOffer: boolean,
  preMatchedRules: EscalationRuleInput[],
): string {
  const sections: string[] = [];

  sections.push(
    [
      "=== ESCALATION DECISION ===",
      "Decide whether this conversation should be handed off to a human agent. Consider BOTH configured guidance (below) and baseline signals.",
      "",
      "BASELINE SIGNALS — always watch for these, even when no guidance matches:",
      "  - `direct_human_request`: customer explicitly asks to talk to a human/agent/person/representative (e.g., \"can I talk to a human\", \"connect me to someone\", \"I want to speak to a person\").",
      "  - `keyword_agent_support`: customer mentions \"agent\" or \"support\" in a way that implies wanting human help.",
      "  - `how_to_contact`: customer asks how to contact support or get help from a human.",
      "  - `anger_frustration`: customer expresses strong frustration or anger (e.g., \"this is ridiculous\", \"waste of time\", \"I'm furious\", repeated complaints, sarcasm, insults).",
      "  - `repetition_loop`: scan the last 3–5 user turns — the customer is repeating the same question/issue without making progress, or the assistant keeps giving the same answer.",
      "  - `first_turn_escalation`: the customer's VERY FIRST message is itself a request for escalation, a complaint, or a statement of frustration.",
      "",
      "Set `baselineTriggers` to the array of signals that apply (may be empty). Prefer empty when unsure.",
      "",
      "GUIDANCE MATCHING:",
      "- Set `escalate` to true ONLY when the latest customer message (in context of the conversation) clearly matches one of the guidance entries below.",
      "- When matching guidance, set `chosenGuidanceId` to the id of the matched guidance.",
      "- Put a SHORT plain-text reason (max 1 sentence, quoting the trigger) into `escalationReason`.",
      "- If no guidance matches, `escalate` must be false, `chosenGuidanceId` empty, `escalationReason` empty.",
      "",
      "RESPONSE CONTENT:",
      "- If baseline `direct_human_request` applies, OR guidance/rule matches with `mode: offer` or `mode: immediate`, OR a PRE-MATCHED RULE (below) applies, write your `response` as a BRIEF acknowledgment that offers to connect with a human. Do NOT attempt to answer the original question in that case.",
      "- For `mode: immediate`, phrase the response as a direct reassurance that a human will take over (e.g., \"I'll connect you with someone from our team right away.\").",
      "- For `mode: offer`, phrase the response as an offer the customer can accept or decline (e.g., \"I can connect you with a human — would you like me to do that?\").",
      "- If the matched guidance has `mode: ask_more`, write `response` as a specific follow-up question to clarify the situation.",
      "- If the matched guidance has `mode: never`, continue answering the customer normally and do NOT offer human handoff.",
      "- Otherwise, answer normally.",
    ].join("\n"),
  );

  if (preMatchedRules.length > 0) {
    const blocks = preMatchedRules
      .map((r) => {
        const mode = r.mode ?? "immediate";
        const title = r.title || "Untitled rule";
        return `- title: ${title} | mode: ${mode}`;
      })
      .join("\n");
    sections.push(
      [
        "PRE-MATCHED RULES (server-evaluated — these WILL trigger escalation for this turn; write your response to match their mode):",
        "",
        blocks,
      ].join("\n"),
    );
  }

  if (escalationGuidance.length > 0) {
    const blocks = escalationGuidance
      .map((g) => {
        const id = g._id ?? "unknown";
        const mode = g.mode ?? "immediate";
        const title = g.title || "Escalation rule";
        return `- id: "${id}" | mode: ${mode} | title: ${title}\n  guidance: ${g.content.trim()}`;
      })
      .join("\n");
    sections.push(["CONFIGURED GUIDANCE:", "", blocks].join("\n"));
  } else if (preMatchedRules.length === 0) {
    sections.push(
      "CONFIGURED GUIDANCE: (none) — rely only on baseline signals.",
    );
  }

  if (previousWasOffer) {
    sections.push(
      [
        "OFFER FOLLOW-UP:",
        "- The previous assistant message was an OFFER to connect with a human.",
        "- Classify the customer's latest reply into `offerResponse`:",
        '  - "accepted" — the customer wants to be connected (e.g., "yes", "please", "connect me", "sure", "ok").',
        '  - "declined" — the customer declined (e.g., "no", "not yet", "keep trying", "let\'s continue").',
        '  - "unclear" — the reply does not clearly accept or decline.',
        "- If `accepted`: write `response` as a brief confirmation (\"Connecting you now.\"). If `declined`: continue answering the original question normally. If `unclear`: repeat the offer succinctly.",
      ].join("\n"),
    );
  } else {
    sections.push(
      "OFFER FOLLOW-UP: The previous assistant turn was NOT an offer. Set `offerResponse` to \"not_applicable\".",
    );
  }

  sections.push("=== END ESCALATION DECISION ===");
  return sections.join("\n\n");
}

function buildSystemPrompt(
  activeGuidance: GuidanceRule[],
  personality: Personality | undefined,
  sources: Source[],
  attributes: AttributeSpec[],
  escalationGuidance: EscalationGuidanceSpec[],
  previousWasOffer: boolean,
  preMatchedRules: EscalationRuleInput[],
): string {
  const sections: string[] = [];
  const grounded = sources.length > 0;

  sections.push(
    grounded
      ? "You are a customer-facing AI assistant for a specific business. Answer ONLY using the knowledge base provided below. Do not use outside or general knowledge. If the answer is not in the knowledge base, tell the customer you do not have that information and offer to help with something else."
      : "You are a customer-facing AI assistant for a specific business. No knowledge base has been provided. If the customer asks about specific products, prices, or policies, tell them you do not yet have that information and offer to connect them with a human or take the question for follow-up. Do not invent facts."
  );

  if (grounded) {
    sections.push(
      `=== KNOWLEDGE BASE ===\n${buildKnowledgeSection(sources)}\n=== END KNOWLEDGE BASE ===`
    );
    const validIds = sources.map((s) => `[^${s.id}]`).join(", ");
    sections.push(
      [
        "Citations:",
        `- Cite each unique source at most ONCE in your entire reply. If several facts come from the same source, append that marker one time (typically at the end of the first sentence or bullet that uses it) and never repeat the same marker again in the reply.`,
        `- Example: if all plans come from source [^1], the reply contains [^1] exactly one time — not after every bullet.`,
        `- If multiple distinct sources are used, cite each one at its most relevant location (still once per source).`,
        `- Only use citation numbers from this list — never invent new ones: ${validIds}.`,
        "- Do NOT cite generic filler, greetings, or transitional sentences.",
        "- Your `citationIds` output field MUST list the unique marker numbers actually used, in ascending order.",
      ].join("\n")
    );
  } else {
    sections.push(
      "Citations: no knowledge base is available, so do not emit any [^N] markers and return an empty citationIds array."
    );
  }

  if (personality?.tone || personality?.length) {
    const styleLines: string[] = ["Voice and style:"];
    if (personality.tone) {
      const instr = TONE_INSTRUCTIONS[personality.tone];
      styleLines.push(
        `- Tone: ${personality.tone}${instr ? ` — ${instr}` : ""}`
      );
    }
    if (personality.length) {
      const instr = LENGTH_INSTRUCTIONS[personality.length];
      styleLines.push(
        `- Length: ${personality.length}${instr ? ` — ${instr}` : ""}`
      );
    }
    sections.push(styleLines.join("\n"));
  }

  if (activeGuidance.length > 0) {
    const rules = activeGuidance
      .map((g) => `- ${g.title || "Guideline"}: ${g.content.trim()}`)
      .join("\n");
    sections.push(`Guidelines (must be followed in every response):\n${rules}`);
  }

  sections.push(
    [
      "Formatting:",
      "- Use GitHub-flavored markdown.",
      "- Put specific numbers (prices, limits, dates) and proper nouns in **bold** when they matter.",
      "- Never use headings (#, ##). Never use tables.",
      "- The Length rule above controls depth-per-item within bullets; it does not remove structure.",
    ].join("\n")
  );

  const attrSection = buildAttributeSection(attributes);
  if (attrSection) sections.push(attrSection);

  const escalationSection = buildEscalationSection(
    escalationGuidance,
    previousWasOffer,
    preMatchedRules,
  );
  if (escalationSection) sections.push(escalationSection);

  sections.push(
    [
      "Follow-up handling:",
      "- The `response` field must END with the last substantive fact/bullet and NOTHING ELSE. Do not add sentences like 'If you want, I can help you pick the best fit', 'Is that what you were looking for?', or 'Let me know if you have questions'.",
      "- Put any such closing question, offer, or invitation into the `followUp` field as plain prose (1 sentence max, no markdown, no citations).",
      "- If the response is a simple factual answer that doesn't need a follow-up, return `followUp` as an empty string.",
    ].join("\n")
  );

  if (activeGuidance.length > 0) {
    sections.push(
      [
        "Self-check before responding:",
        '- Re-read your draft and ask for each guideline: "Does every sentence of my response fully comply with this rule, including its examples?" Revise until YES, or exclude the guideline from guidanceApplied.',
        "- If your response contains any jargon, buzzwords, or phrasing a guideline prohibits, DO NOT list that guideline.",
        "- If in doubt, leave the guideline out.",
      ].join("\n")
    );
  }

  return sections.join("\n\n");
}

function buildResponseSchema(
  activeGuidanceCount: number,
  attributeCount: number,
  escalationGuidanceCount: number,
) {
  const properties: Record<string, unknown> = {
    response: {
      type: "string",
      description:
        "Main reply content in markdown. Contains the substantive answer (facts, bullets, prices, explanations). Include [^N] citation markers inline for facts taken from the numbered knowledge base sources. DO NOT end with a follow-up question or offer — that goes in followUp.",
    },
    followUp: {
      type: "string",
      description:
        "Optional short closing question or offer (e.g., 'Is that what you were looking for?', 'Want me to walk you through the best fit?', 'Anything else I can help with?'). Plain prose, 1 sentence max, NO markdown, NO citations. Leave empty string if the response doesn't warrant a follow-up.",
    },
    citationIds: {
      type: "array",
      items: { type: "integer" },
      description:
        "Unique citation numbers actually used as [^N] markers inside the response, in ascending order.",
    },
  };
  const required = ["response", "followUp", "citationIds"];
  if (activeGuidanceCount > 0) {
    properties.guidanceApplied = {
      type: "array",
      items: { type: "string" },
      description:
        "Exact titles of guidelines that the final response fully complies with.",
    };
    required.push("guidanceApplied");
  } else {
    properties.guidanceApplied = {
      type: "array",
      items: { type: "string" },
      description:
        "No guidelines are configured; return an empty array.",
    };
    required.push("guidanceApplied");
  }

  properties.attributeDetections = {
    type: "array",
    description:
      attributeCount > 0
        ? "One entry per attribute listed in ATTRIBUTE DETECTION, in the same order. Use the attribute's id and the chosen value id (or null if no value applies)."
        : "No attributes are configured; return an empty array.",
    items: {
      type: "object",
      additionalProperties: false,
      required: ["attributeId", "valueId"],
      properties: {
        attributeId: { type: "string" },
        valueId: { type: ["string", "null"] },
      },
    },
  };
  required.push("attributeDetections");

  properties.escalate = {
    type: "boolean",
    description:
      escalationGuidanceCount > 0
        ? "True if the conversation matches one of the ESCALATION GUIDANCE rules and should be handed off to a human."
        : "No escalation guidance is configured; return false.",
  };
  properties.escalationReason = {
    type: "string",
    description:
      escalationGuidanceCount > 0
        ? "Short plain-text reason describing which guideline triggered escalation. Empty string when escalate is false."
        : "No escalation guidance is configured; return an empty string.",
  };
  properties.chosenGuidanceId = {
    type: "string",
    description:
      escalationGuidanceCount > 0
        ? "When escalate is true, set this to the id of the matched guidance entry (copy it verbatim from CONFIGURED GUIDANCE). Empty string when escalate is false or no guidance matches."
        : "No escalation guidance is configured; return an empty string.",
  };
  properties.baselineTriggers = {
    type: "array",
    items: {
      type: "string",
      enum: BASELINE_TRIGGERS,
    },
    description:
      "Baseline escalation signals that apply to the latest user message. May be empty. See BASELINE SIGNALS in the system prompt for the meaning of each value.",
  };
  properties.offerResponse = {
    type: "string",
    enum: ["accepted", "declined", "unclear", "not_applicable"],
    description:
      'Classification of whether the latest user message accepts/declines a prior human-handoff offer. Use "not_applicable" when the previous assistant turn was not an offer.',
  };
  required.push(
    "escalate",
    "escalationReason",
    "chosenGuidanceId",
    "baselineTriggers",
    "offerResponse",
  );

  return {
    name: "agent_reply",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required,
      properties,
    },
  };
}

function sseEvent(event: StreamEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: NextRequest) {
  if (!OPENAI_API_KEY) {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          sseEvent({ type: "error", message: "OpenAI API key not configured" })
        );
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const body = (await request.json()) as {
    messages: ChatMessage[];
    guidance?: GuidanceRule[];
    personality?: Personality;
    attributes?: AttributeSpec[];
    escalationRules?: EscalationRuleInput[];
    escalationGuidance?: EscalationGuidanceSpec[];
    conversationId?: string | null;
  };

  const activeGuidance = (body.guidance ?? []).filter(
    (g) => g.content?.trim().length > 0
  );

  const activeAttributes = (body.attributes ?? []).filter(
    (a) => a.title?.trim().length > 0 && a.values.length >= 2
  );

  const activeEscalationGuidance = (body.escalationGuidance ?? []).filter(
    (g) => g.content?.trim().length > 0,
  );
  const activeEscalationRules = (body.escalationRules ?? []).filter(
    (r) => r.enabled && r.conditionGroups.some((g) => g.conditions.length > 0),
  );

  let conversationId: Id<"conversations"> | null =
    (body.conversationId as Id<"conversations"> | null | undefined) ?? null;
  const hasEscalationConfigured =
    activeEscalationRules.length > 0 || activeEscalationGuidance.length > 0;
  if (
    !conversationId &&
    (activeAttributes.length > 0 || hasEscalationConfigured)
  ) {
    try {
      conversationId = await fetchMutation(api.conversations.start, {});
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  }

  const lastUserMessage =
    [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  type OfferContext = {
    _id: Id<"conversations">;
    offerState: "none" | "offered" | "accepted" | "declined";
    lastAssistantAction: "normal" | "offer" | "escalated";
    lastOfferAt: number | null;
  };

  const offerContextPromise: Promise<OfferContext | null> = conversationId
    ? fetchQuery(api.conversations.getOfferContext, { conversationId }).catch(
        (err) => {
          console.error("getOfferContext failed:", err);
          return null;
        },
      )
    : Promise.resolve(null);

  const sourcesPromise: Promise<Source[]> = fetchAction(
    api.rag.searchKnowledge,
    { query: lastUserMessage, limit: 10 },
  )
    .then((result) => result.sources)
    .catch((err) => {
      console.error("RAG search failed:", err);
      return [] as Source[];
    });

  const [offerContext, sources] = await Promise.all([
    offerContextPromise,
    sourcesPromise,
  ]);

  const previousWasOffer = offerContext?.lastAssistantAction === "offer";

  // Pre-evaluate non-attribute rule conditions (message_content, detected_language,
  // turn_count) before the LLM runs. If any match, tell the LLM about them so it
  // writes a proper handoff acknowledgment instead of a generic answer we'd have
  // to rewrite after the fact. Attribute-dependent rules are evaluated post-LLM
  // since detections come from the same call.
  const preLLMTurnCount = body.messages.filter((m) => m.role === "user").length;
  const { matched: preMatchedRules } = evaluateRulesPreLLM(
    activeEscalationRules,
    {
      messageContent: lastUserMessage,
      detectedLanguage: detectLanguageHeuristic(lastUserMessage),
      turnCount: preLLMTurnCount,
    },
  );

  const systemPrompt = buildSystemPrompt(
    activeGuidance,
    body.personality,
    sources,
    activeAttributes,
    activeEscalationGuidance,
    previousWasOffer,
    preMatchedRules,
  );
  const responseSchema = buildResponseSchema(
    activeGuidance.length,
    activeAttributes.length,
    activeEscalationGuidance.length,
  );
  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort());

  const stream = new ReadableStream({
    async start(controller) {
      const start = Date.now();
      const emit = (event: StreamEvent) => {
        try {
          controller.enqueue(sseEvent(event));
        } catch {
          // controller may be closed if client disconnected
        }
      };

      let openaiResponse: Response;
      try {
        openaiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-5.4-mini-2026-03-17",
              messages: [
                { role: "system", content: systemPrompt },
                ...body.messages,
              ],
              response_format: { type: "json_schema", json_schema: responseSchema },
              max_completion_tokens: 1024,
              reasoning_effort: "low",
              stream: true,
            }),
            signal: abortController.signal,
          }
        );
      } catch (err) {
        emit({
          type: "error",
          message: err instanceof Error ? err.message : "Network error",
        });
        controller.close();
        return;
      }

      if (!openaiResponse.ok || !openaiResponse.body) {
        let message = "OpenAI request failed";
        try {
          const errData = await openaiResponse.json();
          message = errData.error?.message || message;
        } catch {}
        emit({ type: "error", message });
        controller.close();
        return;
      }

      const reader = openaiResponse.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let rawJson = "";
      let emittedResponseLen = 0;

      const tryEmitDeltas = () => {
        try {
          const partial = parsePartial(rawJson, Allow.ALL);
          const currentResp =
            typeof partial?.response === "string" ? partial.response : "";
          if (currentResp.length > emittedResponseLen) {
            const delta = currentResp.slice(emittedResponseLen);
            emittedResponseLen = currentResp.length;
            emit({ type: "delta", text: delta });
          }
        } catch {
          // not yet parseable
        }
      };

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const chunk = JSON.parse(data);
              const content = chunk.choices?.[0]?.delta?.content;
              if (typeof content === "string" && content.length > 0) {
                rawJson += content;
                tryEmitDeltas();
              }
            } catch {
              // skip malformed chunk
            }
          }
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          emit({
            type: "error",
            message: err instanceof Error ? err.message : "Stream error",
          });
        }
        controller.close();
        return;
      }

      // Final parse + metadata
      let finalResponse = "";
      let followUp = "";
      let citationIds: number[] = [];
      let guidanceApplied: string[] = [];
      let rawDetections: Array<{ attributeId: string; valueId: string | null }> = [];
      let llmEscalate = false;
      let llmEscalationReason = "";
      let chosenGuidanceId: string | null = null;
      let baselineTriggers: BaselineTrigger[] = [];
      let offerResponse: OfferResponseKind = "not_applicable";
      try {
        const parsed = JSON.parse(rawJson) as {
          response?: unknown;
          followUp?: unknown;
          citationIds?: unknown;
          guidanceApplied?: unknown;
          attributeDetections?: unknown;
          escalate?: unknown;
          escalationReason?: unknown;
          chosenGuidanceId?: unknown;
          baselineTriggers?: unknown;
          offerResponse?: unknown;
        };
        if (typeof parsed.response === "string") finalResponse = parsed.response;
        if (typeof parsed.followUp === "string") followUp = parsed.followUp.trim();
        if (Array.isArray(parsed.citationIds)) {
          citationIds = parsed.citationIds
            .filter((n): n is number => typeof n === "number" && Number.isInteger(n));
        }
        if (Array.isArray(parsed.guidanceApplied)) {
          guidanceApplied = parsed.guidanceApplied.filter(
            (t): t is string => typeof t === "string"
          );
        }
        if (Array.isArray(parsed.attributeDetections)) {
          rawDetections = parsed.attributeDetections.flatMap((d) => {
            if (!d || typeof d !== "object") return [];
            const rec = d as Record<string, unknown>;
            if (typeof rec.attributeId !== "string") return [];
            const valueId =
              typeof rec.valueId === "string" ? rec.valueId : null;
            return [{ attributeId: rec.attributeId, valueId }];
          });
        }
        if (typeof parsed.escalate === "boolean") llmEscalate = parsed.escalate;
        if (typeof parsed.escalationReason === "string") {
          llmEscalationReason = parsed.escalationReason.trim();
        }
        if (typeof parsed.chosenGuidanceId === "string") {
          const trimmed = parsed.chosenGuidanceId.trim();
          chosenGuidanceId = trimmed.length > 0 ? trimmed : null;
        }
        if (Array.isArray(parsed.baselineTriggers)) {
          baselineTriggers = Array.from(
            new Set(
              parsed.baselineTriggers.filter(
                (v): v is BaselineTrigger =>
                  typeof v === "string" && isBaselineTrigger(v),
              ),
            ),
          );
        }
        if (typeof parsed.offerResponse === "string") {
          if (
            parsed.offerResponse === "accepted" ||
            parsed.offerResponse === "declined" ||
            parsed.offerResponse === "unclear" ||
            parsed.offerResponse === "not_applicable"
          ) {
            offerResponse = parsed.offerResponse;
          }
        }
      } catch {
        // partial parse fallback
        try {
          const partial = parsePartial(rawJson, Allow.ALL);
          if (typeof partial?.response === "string") finalResponse = partial.response;
          if (typeof partial?.followUp === "string") followUp = partial.followUp.trim();
        } catch {}
      }

      if (!previousWasOffer) {
        offerResponse = "not_applicable";
      }

      // Flush any final tail that wasn't emitted yet
      if (finalResponse.length > emittedResponseLen) {
        emit({
          type: "delta",
          text: finalResponse.slice(emittedResponseLen),
        });
        emittedResponseLen = finalResponse.length;
      }

      const sourceById = new Map(sources.map((s) => [s.id, s]));
      const seenIds = new Set<number>();
      const citations: Citation[] = [];
      for (const id of citationIds) {
        if (seenIds.has(id)) continue;
        const src = sourceById.get(id);
        if (!src) continue;
        seenIds.add(id);
        citations.push({
          id: src.id,
          title: src.title,
          url: src.url,
          snippet: src.snippet,
        });
      }

      const validTitles = new Set(
        activeGuidance.map((g) => g.title || "Guideline")
      );
      const filteredGuidance = guidanceApplied.filter((t) => validTitles.has(t));

      const attrById = new Map(activeAttributes.map((a) => [a.id, a]));
      const seenAttrIds = new Set<string>();
      const attributeDetections: AttributeDetection[] = [];
      for (const d of rawDetections) {
        if (seenAttrIds.has(d.attributeId)) continue;
        const attr = attrById.get(d.attributeId);
        if (!attr) continue;
        seenAttrIds.add(d.attributeId);
        const matchedValue = d.valueId
          ? attr.values.find((v) => v.id === d.valueId) ?? null
          : null;
        attributeDetections.push({
          attributeId: attr.id,
          attributeTitle: attr.title,
          valueId: matchedValue ? matchedValue.id : null,
          valueName: matchedValue ? matchedValue.name : null,
        });
      }

      let matchedRules: EscalationRuleInput[] = [];
      if (activeEscalationRules.length > 0) {
        const turnCount = body.messages.filter((m) => m.role === "user").length;
        const { matched } = evaluateEscalationRules(activeEscalationRules, {
          attributeDetections: attributeDetections.map((d) => ({
            attributeId: d.attributeId,
            valueId: d.valueId,
          })),
          messageContent: lastUserMessage,
          detectedLanguage: detectLanguageHeuristic(lastUserMessage),
          turnCount,
        });
        matchedRules = matched;
      }

      const matchedRuleChoices: RuleChoice[] = matchedRules.map((r) => ({
        ...r,
        mode: r.mode ?? "immediate",
      }));

      let chosenGuidance: GuidanceChoice | null = null;
      if (chosenGuidanceId) {
        const match = activeEscalationGuidance.find(
          (g) => g._id === chosenGuidanceId,
        );
        if (match) {
          chosenGuidance = {
            _id: match._id,
            title: match.title,
            mode: match.mode ?? "immediate",
          };
        }
      }

      const decision = resolveEscalationDecision({
        matchedRules: matchedRuleChoices,
        llmEscalate,
        llmEscalationReason: llmEscalationReason || null,
        chosenGuidance,
        baselineTriggers,
      });

      const offerAccepted =
        previousWasOffer && offerResponse === "accepted";

      // Double-offer guardrail: if the previous turn was already an offer and
      // we would offer again without an acceptance, force immediate to avoid looping.
      let forcedByDoubleOffer = false;
      let effectiveMode: EscalationMode = decision.mode;
      let effectiveTriggeredBy: EscalationTriggeredBy | null =
        decision.triggeredBy;
      let effectiveReason: string | null = decision.reason;

      if (offerAccepted) {
        effectiveMode = "immediate";
        effectiveTriggeredBy = decision.triggeredBy ?? "baseline";
        effectiveReason =
          decision.reason ?? "Customer accepted the offer to connect with a human.";
      } else if (previousWasOffer && decision.mode === "offer") {
        forcedByDoubleOffer = true;
        effectiveMode = "immediate";
        effectiveTriggeredBy = decision.triggeredBy;
        effectiveReason =
          decision.reason ??
          "Repeated offer — escalating to a human after a second prompt.";
      }

      const escalate = effectiveMode === "immediate";
      const escalationTriggeredBy: EscalationTriggeredBy | null = escalate
        ? effectiveTriggeredBy
        : null;
      const escalationReason: string | null = escalate ? effectiveReason : null;
      const escalationRuleTitles =
        escalate && decision.triggeredBy === "rule" ? decision.ruleTitles : [];

      const offerSuggestedReplies =
        effectiveMode === "offer"
          ? ["Yes, connect me with a human", "No, keep trying"]
          : [];
      const offerAcknowledged: "accepted" | "declined" | null =
        previousWasOffer &&
        (offerResponse === "accepted" || offerResponse === "declined")
          ? offerResponse
          : null;

      emit({
        type: "done",
        followUp,
        citations,
        guidanceApplied: filteredGuidance,
        rulesApplied: activeGuidance.length,
        knowledgePagesAvailable: sources.length,
        latencyMs: Date.now() - start,
        attributeDetections,
        conversationId: conversationId ?? null,
        escalate,
        escalationReason,
        escalationTriggeredBy,
        escalationRuleTitles,
        decisionMode: effectiveMode,
        baselineTriggers,
        topBaselineTrigger: decision.topBaselineTrigger,
        offerSuggestedReplies,
        offerAcknowledged,
        forcedByDoubleOffer,
      });
      controller.close();

      const statsTasks: Promise<unknown>[] = [];

      if (conversationId && attributeDetections.length > 0) {
        const convId = conversationId;
        for (const d of attributeDetections) {
          if (d.valueId === null) continue;
          statsTasks.push(
            fetchMutation(api.conversations.recordDetection, {
              conversationId: convId,
              attributeId: d.attributeId as Id<"attributes">,
              valueId: d.valueId as string,
            }).catch((err) => {
              console.error("recordDetection failed:", err);
            }),
          );
        }
      }

      if (matchedRules.length > 0) {
        statsTasks.push(
          fetchMutation(api.escalationRules.recordMatch, {
            ids: matchedRules.map((r) => r._id as Id<"escalationRules">),
            ...(conversationId ? { conversationId } : {}),
          }).catch((err) => {
            console.error("recordMatch failed:", err);
          }),
        );
      }

      const guidanceIds = activeEscalationGuidance
        .map((g) => g._id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
        .map((id) => id as Id<"escalationGuidance">);
      if (guidanceIds.length > 0) {
        statsTasks.push(
          fetchMutation(api.escalationGuidance.recordUse, {
            ids: guidanceIds,
            escalated: escalationTriggeredBy === "guidance",
            ...(conversationId ? { conversationId } : {}),
          }).catch((err) => {
            console.error("recordUse failed:", err);
          }),
        );
      }

      if (conversationId) {
        const convId = conversationId;
        if (previousWasOffer && offerAcknowledged) {
          statsTasks.push(
            fetchMutation(api.conversations.recordOfferResponse, {
              conversationId: convId,
              accepted: offerAcknowledged === "accepted",
            }).catch((err) => {
              console.error("recordOfferResponse failed:", err);
            }),
          );
        }

        const nextAction: "normal" | "offer" | "escalated" = escalate
          ? "escalated"
          : effectiveMode === "offer"
            ? "offer"
            : "normal";

        if (nextAction === "offer") {
          statsTasks.push(
            fetchMutation(api.conversations.recordOffer, {
              conversationId: convId,
            }).catch((err) => {
              console.error("recordOffer failed:", err);
            }),
          );
        } else {
          statsTasks.push(
            fetchMutation(api.conversations.recordAssistantAction, {
              conversationId: convId,
              action: nextAction,
            }).catch((err) => {
              console.error("recordAssistantAction failed:", err);
            }),
          );
        }

        if (escalate) {
          const source = decisionSourceForAnalytics(decision, offerAccepted);
          if (source) {
            statsTasks.push(
              fetchMutation(api.conversations.recordEscalationSource, {
                conversationId: convId,
                source,
                ...(decision.topBaselineTrigger
                  ? { baselineTrigger: decision.topBaselineTrigger }
                  : {}),
              }).catch((err) => {
                console.error("recordEscalationSource failed:", err);
              }),
            );
          }
        }
      }

      if (statsTasks.length > 0) {
        await Promise.allSettled(statsTasks);
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
