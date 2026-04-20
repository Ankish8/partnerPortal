import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id, TableNames } from "./_generated/dataModel";

export const listAllDesc = <T extends TableNames>(tableName: T) =>
  query({
    args: {},
    handler: async (ctx) => ctx.db.query(tableName).order("desc").collect(),
  });

export const generateStorageUploadUrl = () =>
  mutation({
    args: {},
    handler: async (ctx) => await ctx.storage.generateUploadUrl(),
  });

export const removeWithStorage = <T extends TableNames>(tableName: T) =>
  mutation({
    args: { id: v.id(tableName) },
    handler: async (ctx, args) => {
      const doc = (await ctx.db.get(args.id)) as
        | { storageId?: Id<"_storage"> }
        | null;
      if (doc?.storageId) {
        await ctx.storage.delete(doc.storageId);
      }
      await ctx.db.delete(args.id);
    },
  });
