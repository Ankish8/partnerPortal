import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("whatsappChats").order("desc").collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createFromUpload = mutation({
  args: {
    name: v.string(),
    messageCount: v.number(),
    dateRange: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("whatsappChats", {
      name: args.name,
      messageCount: args.messageCount,
      dateRange: args.dateRange,
      status: "ready",
      sourceType: "upload",
      storageId: args.storageId,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const connectApi = mutation({
  args: {
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("whatsappChats", {
      name: `WhatsApp ${args.phoneNumber}`,
      messageCount: 0,
      dateRange: "",
      status: "processing",
      sourceType: "api",
      phoneNumber: args.phoneNumber,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("whatsappChats") },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.id);
    if (chat?.storageId) {
      await ctx.storage.delete(chat.storageId);
    }
    await ctx.db.delete(args.id);
  },
});
