import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Website sources (synced websites)
  websiteSources: defineTable({
    name: v.string(),
    url: v.string(),
    syncedAt: v.string(),
  }).index("by_url", ["url"]),

  // Individual crawled pages (belongs to a websiteSource)
  syncedPages: defineTable({
    websiteSourceId: v.id("websiteSources"),
    title: v.string(),
    url: v.string(),
    status: v.union(v.literal("live"), v.literal("excluded")),
    aiAgent: v.boolean(),
    audience: v.string(),
    markdown: v.optional(v.string()),
  })
    .index("by_websiteSource", ["websiteSourceId"])
    .index("by_websiteSource_status", ["websiteSourceId", "status"]),

  // Uploaded documents
  documents: defineTable({
    name: v.string(),
    size: v.number(),
    type: v.string(),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    storageId: v.optional(v.id("_storage")),
    uploadedAt: v.string(),
  }).index("by_status", ["status"]),

  // Call recordings
  callRecordings: defineTable({
    name: v.string(),
    size: v.number(),
    duration: v.optional(v.string()),
    status: v.union(
      v.literal("uploading"),
      v.literal("transcribing"),
      v.literal("ready"),
      v.literal("error")
    ),
    storageId: v.optional(v.id("_storage")),
    uploadedAt: v.string(),
  }).index("by_status", ["status"]),

  // Guidance global settings (singleton row — only one is ever written)
  guidanceSettings: defineTable({
    tone: v.union(
      v.literal("friendly"),
      v.literal("neutral"),
      v.literal("matter-of-fact"),
      v.literal("professional"),
      v.literal("humorous")
    ),
    length: v.union(
      v.literal("concise"),
      v.literal("standard"),
      v.literal("thorough")
    ),
  }),

  // Guidance items
  guidanceItems: defineTable({
    categoryId: v.string(),
    title: v.string(),
    content: v.string(),
    enabled: v.boolean(),
    audience: v.string(),
    channels: v.string(),
    stats: v.object({
      used: v.number(),
      resolved: v.optional(v.number()),
      escalated: v.optional(v.number()),
    }),
  }).index("by_category", ["categoryId"]),

  // Attributes — AI-detected conversation classifications
  attributes: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("escalation"),
      v.literal("routing"),
      v.literal("filtering"),
      v.literal("custom"),
    ),
    enabled: v.boolean(),
    audience: v.string(),
    redetectOnClose: v.boolean(),
    values: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
      }),
    ),
    conditions: v.array(
      v.object({
        id: v.string(),
        ifAttributeId: v.id("attributes"),
        ifValueId: v.string(),
        useValueIds: v.array(v.string()),
      }),
    ),
    stats: v.object({
      detected: v.number(),
      conversations: v.optional(v.number()),
      resolved: v.optional(v.number()),
      escalated: v.optional(v.number()),
    }),
  }).index("by_enabled", ["enabled"]),

  // Conversations — preview-panel sessions used for attribute counters
  conversations: defineTable({
    endedAt: v.optional(v.number()),
    outcome: v.optional(
      v.union(v.literal("resolved"), v.literal("escalated")),
    ),
    detections: v.array(
      v.object({
        attributeId: v.id("attributes"),
        valueId: v.string(),
      }),
    ),
  }).index("by_outcome", ["outcome"]),

  // Escalation rules — deterministic conditions that hand off the conversation to a human
  escalationRules: defineTable({
    title: v.string(),
    enabled: v.boolean(),
    // OR across condition groups; AND within each group
    conditionGroups: v.array(
      v.object({
        id: v.string(),
        conditions: v.array(
          v.union(
            v.object({
              kind: v.literal("attribute"),
              id: v.string(),
              attributeId: v.id("attributes"),
              operator: v.union(
                v.literal("is_any_of"),
                v.literal("is_none_of"),
              ),
              valueIds: v.array(v.string()),
            }),
            v.object({
              kind: v.literal("message_content"),
              id: v.string(),
              operator: v.union(
                v.literal("contains"),
                v.literal("not_contains"),
              ),
              text: v.string(),
            }),
            v.object({
              kind: v.literal("detected_language"),
              id: v.string(),
              operator: v.union(
                v.literal("is_any_of"),
                v.literal("is_none_of"),
              ),
              languages: v.array(v.string()),
            }),
            v.object({
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
            }),
          ),
        ),
      }),
    ),
    stats: v.object({
      matched: v.number(),
    }),
  }).index("by_enabled", ["enabled"]),

  // Escalation guidance — natural-language instructions that guide the LLM to escalate
  escalationGuidance: defineTable({
    title: v.string(),
    content: v.string(),
    enabled: v.boolean(),
    audience: v.string(),
    channels: v.string(),
    stats: v.object({
      used: v.number(),
      escalated: v.optional(v.number()),
    }),
  }).index("by_enabled", ["enabled"]),

  // WhatsApp chat imports
  whatsappChats: defineTable({
    name: v.string(),
    messageCount: v.number(),
    dateRange: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    sourceType: v.union(v.literal("upload"), v.literal("api")),
    storageId: v.optional(v.id("_storage")),
    phoneNumber: v.optional(v.string()),
    uploadedAt: v.string(),
  }).index("by_status", ["status"]),
});
