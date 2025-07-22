import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

import { mutation } from "../_generated/server";

export const createNewUserMetric = mutation({
  args: {
    name: v.string(),
    colour: v.string(),
    unit: v.optional(v.string()),
    increment: v.optional(v.float64()),
    valueType: v.optional(v.union(v.literal("float"), v.literal("integer"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("You must be logged in to create a metric");
    }

    const now = Date.now();

    return await ctx.db.insert("userMetrics", {
      userId,
      name: args.name,
      colour: args.colour,
      unit: args.unit,
      increment: args.increment,
      valueType: args.valueType,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createMetricEntry = mutation({
  args: {
    metricId: v.id("userMetrics"),
    value: v.float64(),
    dateFor: v.string(), // e.g., "2025-07-17"
    note: v.optional(v.string()),
  },
  handler: async (ctx, { metricId, value, dateFor, note }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Not authenticated.");
    }

    // Verify the metric belongs to the user
    const metric = await ctx.db.get(metricId);
    if (!metric || metric.userId !== userId) {
      throw new ConvexError("Metric not found or access denied.");
    }

    // Check if an entry already exists for this date
    const existing = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user_metric_date", (q) =>
        q.eq("userId", userId).eq("metricId", metricId).eq("dateFor", dateFor),
      )
      .unique();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        value,
        note,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }

    // Create new entry
    const newId = await ctx.db.insert("userMetricSubmissions", {
      userId,
      metricId,
      dateFor,
      submittedAt: Date.now(),
      value,
      note,
    });

    return await ctx.db.get(newId);
  },
});
