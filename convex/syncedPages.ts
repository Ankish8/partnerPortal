import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const listBySource = query({
  args: { websiteSourceId: v.id("websiteSources") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncedPages")
      .withIndex("by_websiteSource", (q) =>
        q.eq("websiteSourceId", args.websiteSourceId)
      )
      .collect();
  },
});

export const get = query({
  args: { id: v.id("syncedPages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("syncedPages"),
    status: v.union(v.literal("live"), v.literal("excluded")),
  },
  handler: async (ctx, args) => {
    const before = await ctx.db.get(args.id);
    await ctx.db.patch(args.id, { status: args.status });
    if (!before) return;
    if (before.status !== args.status) {
      if (args.status === "live") {
        await ctx.scheduler.runAfter(0, internal.rag.ingestPage, {
          pageId: args.id,
        });
      } else {
        await ctx.scheduler.runAfter(0, internal.rag.removePage, {
          pageId: args.id,
        });
      }
    }
  },
});

export const bulkUpdateStatus = mutation({
  args: {
    ids: v.array(v.id("syncedPages")),
    status: v.union(v.literal("live"), v.literal("excluded")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const before = await ctx.db.get(id);
      await ctx.db.patch(id, { status: args.status });
      if (!before || before.status === args.status) continue;
      if (args.status === "live") {
        await ctx.scheduler.runAfter(0, internal.rag.ingestPage, {
          pageId: id,
        });
      } else {
        await ctx.scheduler.runAfter(0, internal.rag.removePage, {
          pageId: id,
        });
      }
    }
  },
});
