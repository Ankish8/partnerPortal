import { NextRequest } from "next/server";
import { fetchAction } from "convex/nextjs";
import { parse as parsePartial, Allow } from "partial-json";
import { api } from "../../../../convex/_generated/api";

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

interface AttributeSpec {
  id: string;
  title: string;
  description: string;
  values: AttributeValueSpec[];
}

interface AttributeDetection {
  attributeId: string;
  attributeTitle: string;
  valueId: string | null;
  valueName: string | null;
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
  const blocks = attributes.map((a) => {
    const valueLines = a.values
      .map((v) => `    - id: "${v.id}" — ${v.name}: ${v.description}`)
      .join("\n");
    return [
      `- Attribute id: "${a.id}"`,
      `  Title: ${a.title}`,
      `  Purpose: ${a.description}`,
      `  Allowed values:`,
      valueLines,
    ].join("\n");
  });
  return [
    "=== ATTRIBUTE DETECTION ===",
    "For each attribute below, examine the customer's LATEST message and select the single best-matching value id from that attribute's allowed values, or null if no value applies with reasonable confidence.",
    "- Base the decision on the latest user message in context of the conversation so far.",
    "- Use ONLY the value ids listed for each attribute — never invent ids.",
    "- Prefer null over guessing when the message is ambiguous for that attribute.",
    "",
    blocks.join("\n\n"),
    "=== END ATTRIBUTE DETECTION ===",
  ].join("\n");
}

function buildSystemPrompt(
  activeGuidance: GuidanceRule[],
  personality: Personality | undefined,
  sources: Source[],
  attributes: AttributeSpec[]
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

function buildResponseSchema(activeGuidanceCount: number, attributeCount: number) {
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
  };

  const activeGuidance = (body.guidance ?? []).filter(
    (g) => g.content?.trim().length > 0
  );

  const activeAttributes = (body.attributes ?? []).filter(
    (a) => a.title?.trim().length > 0 && a.values.length >= 2
  );

  const lastUserMessage =
    [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  let sources: Source[] = [];
  try {
    const result = await fetchAction(api.rag.searchKnowledge, {
      query: lastUserMessage,
      limit: 10,
    });
    sources = result.sources;
  } catch (err) {
    console.error("RAG search failed:", err);
  }

  const systemPrompt = buildSystemPrompt(
    activeGuidance,
    body.personality,
    sources,
    activeAttributes
  );
  const responseSchema = buildResponseSchema(
    activeGuidance.length,
    activeAttributes.length
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
      try {
        const parsed = JSON.parse(rawJson) as {
          response?: unknown;
          followUp?: unknown;
          citationIds?: unknown;
          guidanceApplied?: unknown;
          attributeDetections?: unknown;
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
      } catch {
        // partial parse fallback
        try {
          const partial = parsePartial(rawJson, Allow.ALL);
          if (typeof partial?.response === "string") finalResponse = partial.response;
          if (typeof partial?.followUp === "string") followUp = partial.followUp.trim();
        } catch {}
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

      emit({
        type: "done",
        followUp,
        citations,
        guidanceApplied: filteredGuidance,
        rulesApplied: activeGuidance.length,
        knowledgePagesAvailable: sources.length,
        latencyMs: Date.now() - start,
        attributeDetections,
      });
      controller.close();
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
