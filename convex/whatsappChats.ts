import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  generateStorageUploadUrl,
  listAllDesc,
  removeWithStorage,
} from "./lib";

export const list = listAllDesc("whatsappChats");

export const generateUploadUrl = generateStorageUploadUrl();

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

export const remove = removeWithStorage("whatsappChats");
