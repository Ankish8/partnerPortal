import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { listAllDesc } from "./lib";

const modeValidator = v.union(
  v.literal("immediate"),
  v.literal("offer"),
  v.literal("ask_more"),
  v.literal("never"),
);

export const list = listAllDesc("escalationGuidance");

export const listEnabled = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("escalationGuidance")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    audience: v.string(),
    channels: v.string(),
    mode: v.optional(modeValidator),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("escalationGuidance", {
      title: args.title,
      content: args.content,
      enabled: false,
      audience: args.audience,
      channels: args.channels,
      mode: args.mode ?? "immediate",
      stats: { used: 0 },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("escalationGuidance"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    audience: v.optional(v.string()),
    channels: v.optional(v.string()),
    mode: v.optional(modeValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.enabled !== undefined) updates.enabled = fields.enabled;
    if (fields.audience !== undefined) updates.audience = fields.audience;
    if (fields.channels !== undefined) updates.channels = fields.channels;
    if (fields.mode !== undefined) updates.mode = fields.mode;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("escalationGuidance") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const ensureSeeded = mutation({
  args: {
    items: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("escalationGuidance").take(1);
    if (existing.length > 0) return;
    for (const item of args.items) {
      await ctx.db.insert("escalationGuidance", {
        title: item.title,
        content: item.content,
        enabled: false,
        audience: "Everyone",
        channels: "All channels",
        stats: { used: 0 },
      });
    }
  },
});

export const recordUse = mutation({
  args: {
    ids: v.array(v.id("escalationGuidance")),
    escalated: v.boolean(),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const item = await ctx.db.get(id);
      if (!item) continue;
      await ctx.db.patch(id, {
        stats: {
          ...item.stats,
          used: item.stats.used + 1,
          escalated:
            (item.stats.escalated ?? 0) + (args.escalated ? 1 : 0),
        },
      });
    }

    if (args.conversationId) {
      const conversation = await ctx.db.get(args.conversationId);
      if (!conversation) return;
      const existing = new Set(conversation.appliedGuidanceIds ?? []);
      let changed = false;
      for (const id of args.ids) {
        if (!existing.has(id)) {
          existing.add(id);
          changed = true;
        }
      }
      if (changed) {
        await ctx.db.patch(args.conversationId, {
          appliedGuidanceIds: Array.from(existing),
        });
      }
    }
  },
});
