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
