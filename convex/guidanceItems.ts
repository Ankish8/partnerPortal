import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { listAllDesc } from "./lib";

export const list = listAllDesc("guidanceItems");

export const listByCategory = query({
  args: { categoryId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guidanceItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

export const create = mutation({
  args: {
    categoryId: v.string(),
    title: v.string(),
    content: v.string(),
    audience: v.string(),
    channels: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("guidanceItems", {
      categoryId: args.categoryId,
      title: args.title,
      content: args.content,
      enabled: false,
      audience: args.audience,
      channels: args.channels,
      stats: { used: 0 },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("guidanceItems"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    audience: v.optional(v.string()),
    channels: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, string | boolean> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.enabled !== undefined) updates.enabled = fields.enabled;
    if (fields.audience !== undefined) updates.audience = fields.audience;
    if (fields.channels !== undefined) updates.channels = fields.channels;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("guidanceItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
