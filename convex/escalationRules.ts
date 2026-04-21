import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { listAllDesc } from "./lib";

const attributeConditionValidator = v.object({
  kind: v.literal("attribute"),
  id: v.string(),
  attributeId: v.id("attributes"),
  operator: v.union(
    v.literal("is_any_of"),
    v.literal("is_none_of"),
    v.literal("has_any_value"),
  ),
  valueIds: v.array(v.string()),
});

const messageContentConditionValidator = v.object({
  kind: v.literal("message_content"),
  id: v.string(),
  operator: v.union(v.literal("contains"), v.literal("not_contains")),
  text: v.string(),
});

const detectedLanguageConditionValidator = v.object({
  kind: v.literal("detected_language"),
  id: v.string(),
  operator: v.union(v.literal("is_any_of"), v.literal("is_none_of")),
  languages: v.array(v.string()),
});

const turnCountConditionValidator = v.object({
  kind: v.literal("turn_count"),
  id: v.string(),
  operator: v.union(
    v.literal("gt"),
    v.literal("gte"),
    v.literal("lt"),
    v.literal("lte"),
    v.literal("equals"),
  ),
  value: v.number(),
});

const conditionValidator = v.union(
  attributeConditionValidator,
  messageContentConditionValidator,
  detectedLanguageConditionValidator,
  turnCountConditionValidator,
);

const conditionGroupValidator = v.object({
  id: v.string(),
  conditions: v.array(conditionValidator),
});

export const list = listAllDesc("escalationRules");

export const listEnabled = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("escalationRules")
      .withIndex("by_enabled", (q) => q.eq("enabled", true))
      .collect();
  },
});

const modeValidator = v.union(v.literal("immediate"), v.literal("offer"));

export const create = mutation({
  args: {
    title: v.string(),
    conditionGroups: v.array(conditionGroupValidator),
    mode: v.optional(modeValidator),
    audience: v.optional(v.string()),
    channels: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("escalationRules", {
      title: args.title,
      enabled: false,
      mode: args.mode ?? "immediate",
      audience: args.audience ?? "Everyone",
      channels: args.channels ?? "All channels",
      conditionGroups: args.conditionGroups,
      stats: { matched: 0 },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("escalationRules"),
    title: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    conditionGroups: v.optional(v.array(conditionGroupValidator)),
    mode: v.optional(modeValidator),
    audience: v.optional(v.string()),
    channels: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.enabled !== undefined) updates.enabled = fields.enabled;
    if (fields.conditionGroups !== undefined)
      updates.conditionGroups = fields.conditionGroups;
    if (fields.mode !== undefined) updates.mode = fields.mode;
    if (fields.audience !== undefined) updates.audience = fields.audience;
    if (fields.channels !== undefined) updates.channels = fields.channels;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("escalationRules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const recordMatch = mutation({
  args: {
    ids: v.array(v.id("escalationRules")),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const rule = await ctx.db.get(id);
      if (!rule) continue;
      await ctx.db.patch(id, {
        stats: {
          ...rule.stats,
          matched: rule.stats.matched + 1,
        },
      });
    }

    if (args.conversationId) {
      const conversation = await ctx.db.get(args.conversationId);
      if (!conversation) return;
      const existing = new Set(conversation.matchedRuleIds ?? []);
      let changed = false;
      for (const id of args.ids) {
        if (!existing.has(id)) {
          existing.add(id);
          changed = true;
        }
      }
      if (changed) {
        await ctx.db.patch(args.conversationId, {
          matchedRuleIds: Array.from(existing),
        });
      }
    }
  },
});
