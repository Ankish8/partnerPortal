import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  generateStorageUploadUrl,
  listAllDesc,
  removeWithStorage,
} from "./lib";

export const list = listAllDesc("callRecordings");

export const generateUploadUrl = generateStorageUploadUrl();

export const create = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    duration: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("callRecordings", {
      name: args.name,
      size: args.size,
      duration: args.duration,
      status: "ready",
      storageId: args.storageId,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const remove = removeWithStorage("callRecordings");
