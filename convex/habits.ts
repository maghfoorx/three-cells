import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";

export const getAllUserHabits = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    return await ctx.db
      .query("userHabits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
export const createNewUserHabit = mutation({
  args: {
    name: v.string(),
    colour: v.string(),
    habitQuestion: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to create a new habit");
    }

    const now = Date.now();

    const habitId = await ctx.db.insert("userHabits", {
      userId,
      name: args.name,
      colour: args.colour,
      habitQuestion: args.habitQuestion,
      type: "yes_no",

      frequency: {
        mode: "daily",
        interval: undefined,
        timesPerPeriod: undefined,
        daysOfWeek: undefined,
        startDate: now,
      },

      updatedAt: now,
    });

    return habitId;
  },
});

export const getAllSubmissionsForHabit = query({
  args: { habitId: v.id("userHabits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in view habits");
    }

    const habit = await ctx.db
      .query("userHabits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.habitId))
      .unique();

    if (!habit) {
      throw new ConvexError("No habit found with this id");
    }

    const allSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId)
      )
      .collect();

    return {
      habit,
      allSubmissions,
    };
  },
});

export const getSubmissionsForHabit = query({
  args: { habitId: v.id("userHabits"), start: v.number(), end: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in view habits");
    }

    const allSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId)
      )
      .collect();

    return allSubmissions.filter(
      (submission) =>
        new Date(submission.dateFor).getTime() >= args.start &&
        new Date(submission.dateFor).getTime() <= args.end
    );
  },
});

export const toggleYesNoHabitSubmission = mutation({
  // dateFor is in yyyy-mm-dd format
  args: { habitId: v.id("userHabits"), dateFor: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged to make a habit entry");
    }

    const existingSubmission = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit_and_date", (q) =>
        q
          .eq("userId", userId)
          .eq("habitId", args.habitId)
          .eq("dateFor", args.dateFor)
      )
      .unique();

    if (existingSubmission) {
      return await ctx.db.delete(existingSubmission._id);
    } else {
      // Else, insert new submission
      return await ctx.db.insert("userHabitSubmissions", {
        userId,
        habitId: args.habitId,
        dateFor: args.dateFor,
        value: true,
        updatedAt: Date.now(),
        submittedAt: Date.now(),
      });
    }
  },
});

export const bulkCompleteSelectedDates = mutation({
  args: { habitId: v.id("userHabits"), selectedDates: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged to make a habit entry");
    }

    // Fetch existing submissions for these dates
    const existingSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId)
      )
      .collect();

    const existingDatesSet = new Set(
      existingSubmissions.map((submission) => submission.dateFor)
    );

    const now = Date.now();

    // Filter only dates that don't already have a submission
    const newDates = args.selectedDates.filter(
      (date) => !existingDatesSet.has(date)
    );

    // Insert new submissions for the filtered dates
    const insertPromises = newDates.map((date) =>
      ctx.db.insert("userHabitSubmissions", {
        userId,
        habitId: args.habitId,
        dateFor: date,
        value: true, // Since this is for yes_no habits being "completed"
        submittedAt: now,
        updatedAt: now,
      })
    );

    await Promise.all(insertPromises);

    return { inserted: newDates.length, skipped: existingDatesSet.size };
  },
});

export const bulkUnCompleteSelectedDates = mutation({
  args: { habitId: v.id("userHabits"), selectedDates: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged to delete habit entries");
    }

    // Get all submissions for this habit and user
    const existingSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId)
      )
      .collect();

    // Map dateFor -> submission
    const submissionsByDate: Record<
      string,
      (typeof existingSubmissions)[number]
    > = {};
    for (const submission of existingSubmissions) {
      submissionsByDate[submission.dateFor] = submission;
    }

    // Filter to only those selectedDates that have an existing entry
    const datesToDelete = args.selectedDates.filter(
      (date) => submissionsByDate[date]
    );

    // Delete each one
    const deletePromises = datesToDelete.map((date) =>
      ctx.db.delete(submissionsByDate[date]._id)
    );

    await Promise.all(deletePromises);

    return {
      deleted: datesToDelete.length,
      skipped: args.selectedDates.length - datesToDelete.length,
    };
  },
});
