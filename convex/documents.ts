import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  generateStorageUploadUrl,
  listAllDesc,
  removeWithStorage,
} from "./lib";

export const list = listAllDesc("documents");

export const generateUploadUrl = generateStorageUploadUrl();

export const create = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    type: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      name: args.name,
      size: args.size,
      type: args.type,
      status: "ready",
      storageId: args.storageId,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const remove = removeWithStorage("documents");
