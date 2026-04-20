import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";

export const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

const KNOWLEDGE_NAMESPACE = "knowledge";
const MAX_CHUNK_CHARS = 1800;
const MIN_CHUNK_CHARS = 400;
const CONTEXT_DOC_TRUNCATE = 8000;

function chunkMarkdown(markdown: string): string[] {
  const blocks = markdown.split(/\n(?=#{1,6}\s)/);
  const chunks: string[] = [];
  for (const block of blocks) {
    if (block.length <= MAX_CHUNK_CHARS) {
      chunks.push(block.trim());
      continue;
    }
    const paras = block.split(/\n\n+/);
    let cur = "";
    for (const p of paras) {
      const nextLen = cur ? cur.length + 2 + p.length : p.length;
      if (nextLen > MAX_CHUNK_CHARS && cur.length >= MIN_CHUNK_CHARS) {
        chunks.push(cur.trim());
        cur = p;
      } else {
        cur = cur ? `${cur}\n\n${p}` : p;
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
  }

  const merged: string[] = [];
  for (const c of chunks) {
    if (!c) continue;
    const last = merged.length > 0 ? merged[merged.length - 1] : "";
    if (merged.length > 0 && last.length + 2 + c.length <= MAX_CHUNK_CHARS) {
      merged[merged.length - 1] = `${last}\n\n${c}`;
    } else {
      merged.push(c);
    }
  }
  return merged.filter((c) => c.length > 0);
}

async function generateChunkContext(
  fullDoc: string,
  chunkText: string,
  pageTitle: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "";

  const truncatedDoc =
    fullDoc.length > CONTEXT_DOC_TRUNCATE
      ? `${fullDoc.slice(0, CONTEXT_DOC_TRUNCATE)}\n\n[... document truncated for context generation ...]`
      : fullDoc;

  const userContent = `<document title="${pageTitle}">
${truncatedDoc}
</document>

Here is the chunk we want to situate within the whole document:
<chunk>
${chunkText}
</chunk>

Please give a short succinct context (40-80 tokens) to situate this chunk within the overall document for the purposes of improving search retrieval. Mention the specific product, price, policy, or entity described, and how this chunk relates to the broader document. Answer only with the context, no preamble.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini-2026-03-17",
        messages: [{ role: "user", content: userContent }],
        max_completion_tokens: 160,
        reasoning_effort: "low",
      }),
    });
    if (!response.ok) return "";
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return (data.choices?.[0]?.message?.content ?? "").trim();
  } catch (err) {
    console.error("generateChunkContext failed:", err);
    return "";
  }
}

type PageMetadata = {
  markdown: string;
  title: string;
  url: string;
  pageId: string;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export const chunkerWithContext = rag.defineChunkerAction(async (_ctx, args) => {
  const metadata = args.entry.metadata as PageMetadata | undefined;
  const markdown = metadata?.markdown ?? "";
  const title = metadata?.title ?? args.entry.title ?? "";
  const url = metadata?.url ?? "";

  if (!markdown.trim()) {
    return { chunks: [] };
  }

  const pieces = chunkMarkdown(markdown);
  if (pieces.length === 0) {
    return { chunks: [] };
  }

  const contextual = await Promise.all(
    pieces.map(async (piece) => {
      const context = await generateChunkContext(markdown, piece, title);
      const header = [
        title ? `Source title: ${title}` : "",
        url ? `Source URL: ${url}` : "",
        context ? `Context: ${context}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      return header ? `${header}\n\n${piece}` : piece;
    })
  );

  return { chunks: contextual };
});

export const ingestPage = internalMutation({
  args: { pageId: v.id("syncedPages") },
  handler: async (ctx, { pageId }) => {
    const page = await ctx.db.get(pageId);
    if (!page) return null;
    if (
      page.status !== "live" ||
      !page.aiAgent ||
      !page.markdown ||
      page.markdown.trim().length === 0
    ) {
      return null;
    }

    await rag.addAsync(ctx, {
      namespace: KNOWLEDGE_NAMESPACE,
      key: pageId,
      title: page.title,
      metadata: {
        markdown: page.markdown,
        title: page.title,
        url: page.url,
        pageId: pageId as string,
      },
      chunkerAction: internal.rag.chunkerWithContext,
    });
    return null;
  },
});

export const removePage = internalMutation({
  args: { pageId: v.id("syncedPages") },
  handler: async (ctx, { pageId }) => {
    const namespace = await rag.getNamespace(ctx, {
      namespace: KNOWLEDGE_NAMESPACE,
    });
    if (!namespace) return null;
    await rag.deleteByKeyAsync(ctx, {
      namespaceId: namespace.namespaceId,
      key: pageId,
    });
    return null;
  },
});

export const listPagesForReindex = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("syncedPages").collect();
    return pages
      .filter(
        (p) =>
          p.status === "live" &&
          p.aiAgent &&
          typeof p.markdown === "string" &&
          p.markdown.trim().length > 0
      )
      .map((p) => ({ _id: p._id }));
  },
});

export const reindexAll = action({
  args: {},
  handler: async (ctx): Promise<{ scheduled: number }> => {
    const pages: Array<{ _id: Id<"syncedPages"> }> = await ctx.runQuery(
      internal.rag.listPagesForReindex,
      {}
    );
    for (const p of pages) {
      await ctx.runMutation(internal.rag.ingestPage, { pageId: p._id });
    }
    return { scheduled: pages.length };
  },
});

type KnowledgeSource = {
  id: number;
  entryId: string;
  title: string;
  url: string;
  snippet: string;
  content: string;
};

export const searchKnowledge = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (
    ctx,
    { query, limit }
  ): Promise<{ sources: KnowledgeSource[] }> => {
    if (!query.trim()) return { sources: [] };
    try {
      const result = await rag.search(ctx, {
        namespace: KNOWLEDGE_NAMESPACE,
        query,
        limit: limit ?? 10,
        chunkContext: { before: 0, after: 1 },
      });

      const entryIndex = new Map(
        result.entries.map((e) => [e.entryId as string, e])
      );
      const grouped = new Map<
        string,
        { entry: (typeof result.entries)[number]; chunks: string[] }
      >();
      for (const r of result.results) {
        const entry = entryIndex.get(r.entryId as string);
        if (!entry) continue;
        const joined = r.content.map((c) => c.text).join("\n\n");
        const existing = grouped.get(r.entryId as string);
        if (existing) {
          existing.chunks.push(joined);
        } else {
          grouped.set(r.entryId as string, { entry, chunks: [joined] });
        }
      }

      const sources: KnowledgeSource[] = [];
      let id = 1;
      for (const { entry, chunks } of grouped.values()) {
        const meta = entry.metadata as { url?: string } | undefined;
        const content = chunks.join("\n\n---\n\n");
        const firstBody = chunks[0] ?? "";
        const stripped = firstBody
          .replace(/^Source title:.*$/gim, "")
          .replace(/^Source URL:.*$/gim, "")
          .replace(/^Context:.*$/gim, "")
          .replace(/\s+/g, " ")
          .trim();
        const snippet = decodeEntities(stripped).slice(0, 160);
        sources.push({
          id: id++,
          entryId: entry.entryId as string,
          title: decodeEntities(entry.title ?? ""),
          url: meta?.url ?? "",
          snippet,
          content,
        });
      }

      return { sources };
    } catch (err) {
      console.error("searchKnowledge failed:", err);
      return { sources: [] };
    }
  },
});

export const reingestPage = internalAction({
  args: { pageId: v.id("syncedPages") },
  handler: async (ctx, { pageId }): Promise<null> => {
    await ctx.runMutation(internal.rag.removePage, { pageId });
    await ctx.runMutation(internal.rag.ingestPage, { pageId });
    return null;
  },
});
