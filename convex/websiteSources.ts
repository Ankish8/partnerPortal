import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("websiteSources").collect();
    const result = await Promise.all(
      sources.map(async (source) => {
        const pages = await ctx.db
          .query("syncedPages")
          .withIndex("by_websiteSource", (q) =>
            q.eq("websiteSourceId", source._id)
          )
          .collect();
        const livePages = pages.filter((p) => p.status === "live");
        return {
          ...source,
          totalPages: pages.length,
          livePages: livePages.length,
        };
      })
    );
    return result;
  },
});

export const get = query({
  args: { id: v.id("websiteSources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    pages: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        markdown: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("websiteSources")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();

    if (existing) {
      const oldPages = await ctx.db
        .query("syncedPages")
        .withIndex("by_websiteSource", (q) =>
          q.eq("websiteSourceId", existing._id)
        )
        .collect();
      for (const page of oldPages) {
        await ctx.scheduler.runAfter(0, internal.rag.removePage, {
          pageId: page._id,
        });
        await ctx.db.delete(page._id);
      }

      await ctx.db.patch(existing._id, {
        name: args.name,
        syncedAt: new Date().toISOString(),
      });

      for (const page of args.pages) {
        const newId = await ctx.db.insert("syncedPages", {
          websiteSourceId: existing._id,
          title: page.title,
          url: page.url,
          status: "live",
          aiAgent: true,
          audience: "Everyone",
          markdown: page.markdown,
        });
        if (page.markdown && page.markdown.trim().length > 0) {
          await ctx.scheduler.runAfter(0, internal.rag.ingestPage, {
            pageId: newId,
          });
        }
      }

      return existing._id;
    }

    const sourceId = await ctx.db.insert("websiteSources", {
      name: args.name,
      url: args.url,
      syncedAt: new Date().toISOString(),
    });

    for (const page of args.pages) {
      const newId = await ctx.db.insert("syncedPages", {
        websiteSourceId: sourceId,
        title: page.title,
        url: page.url,
        status: "live",
        aiAgent: true,
        audience: "Everyone",
        markdown: page.markdown,
      });
      if (page.markdown && page.markdown.trim().length > 0) {
        await ctx.scheduler.runAfter(0, internal.rag.ingestPage, {
          pageId: newId,
        });
      }
    }

    return sourceId;
  },
});

export const remove = mutation({
  args: { id: v.id("websiteSources") },
  handler: async (ctx, args) => {
    const pages = await ctx.db
      .query("syncedPages")
      .withIndex("by_websiteSource", (q) =>
        q.eq("websiteSourceId", args.id)
      )
      .collect();
    for (const page of pages) {
      await ctx.scheduler.runAfter(0, internal.rag.removePage, {
        pageId: page._id,
      });
      await ctx.db.delete(page._id);
    }

    await ctx.db.delete(args.id);
  },
});
