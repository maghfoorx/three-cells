import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { format, parseISO, subDays } from "date-fns";

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

export const getMetricTrendData = query({
  args: {
    metricId: v.id("userMetrics"),
    period: v.union(
      v.literal("7days"),
      v.literal("30days"),
      v.literal("90days"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view metrics");
    }

    // Calculate the date range based on period
    const now = new Date();
    let startDate: Date;

    switch (args.period) {
      case "7days":
        startDate = subDays(now, 7);
        break;
      case "30days":
        startDate = subDays(now, 30);
        break;
      case "90days":
        startDate = subDays(now, 90);
        break;
    }

    const startDateString = format(startDate, "yyyy-MM-dd");

    const submissions = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user_and_metric", (q) =>
        q.eq("userId", userId).eq("metricId", args.metricId),
      )
      .filter((q) => q.gte(q.field("dateFor"), startDateString))
      .collect();

    // Sort by date and format for chart
    const sortedData = submissions
      .map((submission) => ({
        date: parseISO(submission.dateFor).getTime(), // Return timestamp instead of Date
        value: submission.value,
        dateFor: submission.dateFor,
        label: format(parseISO(submission.dateFor), "MMM d"),
      }))
      .sort((a, b) => a.date - b.date);

    return sortedData;
  },
});

export const getMetricStatistics = query({
  args: { metricId: v.id("userMetrics") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view metrics");
    }

    const submissions = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user_and_metric", (q) =>
        q.eq("userId", userId).eq("metricId", args.metricId),
      )
      .collect();

    if (submissions.length === 0) {
      return {
        currentValue: null,
        previousValue: null,
        percentageChange: null,
        averageLast7Days: null,
        averageLast30Days: null,
        highestValue: null,
        lowestValue: null,
        totalEntries: 0,
        trend: "neutral" as "up" | "down" | "neutral",
      };
    }

    // Sort submissions by date
    const sortedSubmissions = submissions
      .map((s) => ({
        ...s,
        dateObj: parseISO(s.dateFor),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const values = sortedSubmissions.map((s) => s.value);
    const currentValue = values[values.length - 1];
    const previousValue = values.length > 1 ? values[values.length - 2] : null;

    // Calculate percentage change
    const percentageChange =
      previousValue !== null && previousValue !== 0
        ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
        : null;

    // Determine trend
    let trend: "up" | "down" | "neutral" = "neutral";
    if (percentageChange !== null) {
      if (percentageChange > 0) trend = "up";
      else if (percentageChange < 0) trend = "down";
    }

    // Calculate averages for different periods
    const now = new Date();
    const last7Days = subDays(now, 7);
    const last30Days = subDays(now, 30);

    const last7DaysSubmissions = sortedSubmissions.filter(
      (s) => s.dateObj >= last7Days,
    );
    const last30DaysSubmissions = sortedSubmissions.filter(
      (s) => s.dateObj >= last30Days,
    );

    const averageLast7Days =
      last7DaysSubmissions.length > 0
        ? last7DaysSubmissions.reduce((sum, s) => sum + s.value, 0) /
          last7DaysSubmissions.length
        : null;

    const averageLast30Days =
      last30DaysSubmissions.length > 0
        ? last30DaysSubmissions.reduce((sum, s) => sum + s.value, 0) /
          last30DaysSubmissions.length
        : null;

    return {
      currentValue,
      previousValue,
      percentageChange,
      averageLast7Days,
      averageLast30Days,
      highestValue: Math.max(...values),
      lowestValue: Math.min(...values),
      totalEntries: submissions.length,
      trend,
    };
  },
});

export const getMetricsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const submissions = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("dateFor", date),
      )
      .collect();

    const metricsWithDetails = await Promise.all(
      submissions.map(async (submission) => {
        const metric = await ctx.db.get(submission.metricId);
        if (!metric) return null;

        return {
          name: metric.name,
          value: submission.value,
          unit: metric.unit || "",
          colour: metric.colour,
        };
      }),
    );

    return metricsWithDetails.filter((value) => !!value);
  },
});

export const getSingleMetric = query({
  args: {
    id: v.id("userMetrics"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view metrics");
    }

    const metric = await ctx.db.get(args.id);
    if (!metric || metric.userId !== userId) {
      throw new ConvexError("Metric not found or unauthorized");
    }

    return metric;
  },
});
