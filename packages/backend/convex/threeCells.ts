import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const threeCellForDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const result = await ctx.db
      .query("three_cells")
      .withIndex("by_userId_date_for", (q) =>
        q.eq("userId", userId).eq("dateFor", date),
      )
      .unique();

    return result;
  },
});

export const allThreeCellEntries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    return await ctx.db
      .query("three_cells")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc") // orders by _creationTime
      .collect();
  },
});

export const paginatedThreeCellEntries = query({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
      id: v.number(),
    }),
  },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      // Return empty page if not authenticated
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    return await ctx.db
      .query("three_cells")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc") // orders by _creationTime
      .paginate(paginationOpts);
  },
});

export const submitThreeCellEntry = mutation({
  args: {
    input: v.object({
      date_for: v.string(),
      summary: v.string(),
      score: v.float64(),
    }),
  },
  handler: async (ctx, { input }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("Not authenticated.");
    }

    const existing = await ctx.db
      .query("three_cells")
      .withIndex("by_userId_date_for", (q) =>
        q.eq("userId", userId).eq("dateFor", input.date_for),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        summary: input.summary,
        score: input.score,
        updatedAt: Date.now(),
      });
      return await ctx.db.get(existing._id);
    }

    const newId = await ctx.db.insert("three_cells", {
      userId,
      dateFor: input.date_for,
      summary: input.summary,
      score: input.score,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(newId);
  },
});

export const overallViewOfYear = query({
  args: {
    year: v.string(),
  },
  handler: async (ctx, { year }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const allEnteries = await ctx.db
      .query("three_cells")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const entriesForYear = allEnteries.filter((entry) =>
      entry.dateFor.startsWith(year),
    );

    const scoreMap = entriesForYear.reduce(
      (acc, entry) => {
        const score = entry.score;
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    return scoreMap;
  },
});

export const searchEntries = query({
  args: {
    searchQuery: v.string(),
  },
  handler: async (ctx, { searchQuery }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("three_cells")
      .withSearchIndex("search_summary", (q) =>
        q.search("summary", searchQuery).eq("userId", userId),
      )
      .take(50);
  },
});
