import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";

export const getAllUserMetrics = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    return await ctx.db
      .query("userMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAllUserMetricSubmissions = query({
  args: {
    includeArchived: v.optional(v.boolean()), // default: false
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("You must be logged in to create a metric");
    }

    const includeArchived = args.includeArchived ?? false;

    // 1. Get all metrics for the user (filtered by archive status)
    const userMetrics = await ctx.db
      .query("userMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeMetrics = includeArchived
      ? userMetrics
      : userMetrics.filter((m) => !m.isArchived);

    if (activeMetrics.length === 0) return [];

    // 2. Build a mapping of metricId → metric details
    const metricMap = Object.fromEntries(activeMetrics.map((m) => [m._id, m]));

    const allSubmissions = await Promise.all(
      activeMetrics.map(async (metric) => {
        const submissions = await ctx.db
          .query("userMetricSubmissions")
          .withIndex("by_user_and_metric", (q) =>
            q.eq("userId", userId).eq("metricId", metric._id),
          )
          .order("asc") // by `dateFor` ascending
          .collect();

        return {
          metric,
          submissions,
        };
      }),
    );

    return allSubmissions;
  },
});

export const getAllSubmissionsForMetric = query({
  args: { metricId: v.id("userMetrics") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const metric = await ctx.db
      .query("userMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.metricId))
      .unique();

    const metricSubmissions = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user_and_metric", (q) =>
        q.eq("userId", userId).eq("metricId", args.metricId),
      )
      .collect();

    return {
      metric: metric,
      submissions: metricSubmissions,
    };
  },
});

export const getMetricById = query({
  args: { metricId: v.id("userMetrics") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const metric = await ctx.db
      .query("userMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.metricId))
      .unique();

    return metric;
  },
});

export const latestMetricEntry = query({
  args: {
    metricId: v.id("userMetrics"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (userId == null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const submissions = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user_and_metric", (q) =>
        q.eq("userId", userId).eq("metricId", args.metricId),
      )
      .order("desc")
      .collect();
    if (submissions.length === 0) {
      return null;
    }

    const latest = submissions.sort(
      (a, b) => new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime(),
    )[0];

    return latest;
  },
});
