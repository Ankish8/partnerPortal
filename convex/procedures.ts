import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { listAllDesc } from "./lib";

const statusValidator = v.union(
  v.literal("draft"),
  v.literal("live"),
  v.literal("archived"),
);

export const list = listAllDesc("procedures");

export const listLive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("procedures")
      .withIndex("by_status", (q) => q.eq("status", "live"))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    triggerDescription: v.optional(v.string()),
    examples: v.optional(v.array(v.string())),
    audience: v.optional(v.string()),
    channels: v.optional(v.string()),
    bodyJSON: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("procedures", {
      title: args.title ?? "Untitled",
      status: "draft",
      triggerDescription: args.triggerDescription ?? "",
      examples: args.examples ?? [],
      audience: args.audience ?? "Everyone",
      channels: args.channels ?? "All channels",
      bodyJSON: args.bodyJSON ?? EMPTY_DOC,
      stats: { invocations: 0 },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("procedures"),
    title: v.optional(v.string()),
    status: v.optional(statusValidator),
    triggerDescription: v.optional(v.string()),
    examples: v.optional(v.array(v.string())),
    audience: v.optional(v.string()),
    channels: v.optional(v.string()),
    bodyJSON: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.status !== undefined) {
      updates.status = fields.status;
      if (fields.status === "live") updates.publishedAt = Date.now();
    }
    if (fields.triggerDescription !== undefined)
      updates.triggerDescription = fields.triggerDescription;
    if (fields.examples !== undefined) updates.examples = fields.examples;
    if (fields.audience !== undefined) updates.audience = fields.audience;
    if (fields.channels !== undefined) updates.channels = fields.channels;
    if (fields.bodyJSON !== undefined) updates.bodyJSON = fields.bodyJSON;
    await ctx.db.patch(id, updates);
  },
});

export const publish = mutation({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "live",
      publishedAt: Date.now(),
    });
  },
});

export const unpublish = mutation({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "draft" });
  },
});

export const archive = mutation({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "archived" });
  },
});

export const remove = mutation({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
