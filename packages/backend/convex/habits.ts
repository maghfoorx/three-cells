import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  subDays,
  startOfWeek,
  endOfWeek,
  differenceInDays,
} from "date-fns";

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

export const getSubmissionsForHabit = query({
  args: {
    habitId: v.id("userHabits"),
    start: v.string(),
    end: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    // === Last X Days Submissions ===
    const lastXDaysSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit_and_date", (q) =>
        q
          .eq("userId", userId)
          .eq("habitId", args.habitId)
          .gte("dateFor", args.start)
          .lte("dateFor", args.end)
      )
      .collect();

    // === Current Month Submissions ===
    const monthStart = startOfMonth(now);
    const monthStartStr = format(monthStart, "yyyy-MM-dd");

    const currentMonthSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit_and_date", (q) =>
        q
          .eq("userId", userId)
          .eq("habitId", args.habitId)
          .gte("dateFor", monthStartStr)
          .lte("dateFor", todayStr)
      )
      .collect();

    const submittedDates = currentMonthSubmissions.map((s) =>
      parseISO(s.dateFor)
    );

    const allDaysInMonth = eachDayOfInterval({
      start: monthStart,
      end: now,
    });

    let completedDays = 0;
    for (const day of allDaysInMonth) {
      if (submittedDates.some((s) => isSameDay(s, day))) {
        completedDays++;
      }
    }

    const currentMonthPerformancePercentage =
      (completedDays / allDaysInMonth.length) * 100;

    return {
      lastXDaysSubmissions: lastXDaysSubmissions,
      currentMonthPerformancePercentage: Number(
        currentMonthPerformancePercentage.toFixed(0)
      ),
    };
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

// Updated backend query with all calculations moved server-side
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

    // Calculate all statistics on the backend
    const stats = calculateHabitStatistics(allSubmissions);
    const recentActivity = getRecentActivity(allSubmissions);

    return {
      habit,
      allSubmissions, // Still need this for the calendar heatmap
      stats,
      recentActivity,
    };
  },
});

// Helper functions for backend calculations
function calculateHabitStatistics(submissions: any[]) {
  const now = new Date();

  // Date ranges
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const last30Days = subDays(now, 30);

  const successfulSubmissions = submissions.filter((s) => s.value === true);

  // Filter submissions by time period
  const thisWeekSubmissions = successfulSubmissions.filter((s) => {
    const date = new Date(s.dateFor);
    return date >= thisWeekStart && date <= thisWeekEnd;
  });

  const thisMonthSubmissions = successfulSubmissions.filter((s) => {
    const date = new Date(s.dateFor);
    return date >= thisMonthStart && date <= thisMonthEnd;
  });

  const last30DaysSubmissions = successfulSubmissions.filter((s) => {
    const date = new Date(s.dateFor);
    return date >= last30Days;
  });

  // Calculate streaks
  const streaks = calculateStreaks(submissions);

  // Calculate progress percentages
  const weekProgress = Math.min(
    Math.round((thisWeekSubmissions.length / 7) * 100),
    100
  );
  const monthProgress = Math.min(
    Math.round((thisMonthSubmissions.length / 30) * 100),
    100
  );

  return {
    totalCompleted: successfulSubmissions.length,
    thisWeek: thisWeekSubmissions.length,
    thisMonth: thisMonthSubmissions.length,
    last30Days: last30DaysSubmissions.length,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalDays: submissions.length,
    progress: {
      week: weekProgress,
      month: monthProgress,
      weekCount: thisWeekSubmissions.length,
      monthCount: thisMonthSubmissions.length,
    },
  };
}

function calculateStreaks(submissions: any[]) {
  if (!submissions.length) return { current: 0, longest: 0 };

  // Sort by date and filter successful submissions
  const sortedSubmissions = [...submissions]
    .filter((s) => s.value === true)
    .sort(
      (a, b) => new Date(a.dateFor).getTime() - new Date(b.dateFor).getTime()
    );

  if (!sortedSubmissions.length) return { current: 0, longest: 0 };

  let longestStreak = 0;
  let tempStreak = 1;

  // Calculate longest streak in history
  for (let i = 1; i < sortedSubmissions.length; i++) {
    const prevDate = new Date(sortedSubmissions[i - 1].dateFor);
    const currDate = new Date(sortedSubmissions[i].dateFor);
    const daysDiff = differenceInDays(currDate, prevDate);

    if (daysDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak (from today backwards)
  const today = new Date();
  let currentStreak = 0;
  const recentSubmissions = [...sortedSubmissions].reverse();

  for (const submission of recentSubmissions) {
    const submissionDate = new Date(submission.dateFor);
    const daysDiff = differenceInDays(today, submissionDate);

    if (daysDiff === currentStreak) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

function getRecentActivity(submissions: any[]) {
  return [...submissions]
    .sort(
      (a, b) => new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime()
    )
    .slice(0, 7)
    .map((submission) => ({
      id: submission._id,
      dateFor: submission.dateFor,
      value: submission.value,
      note: submission.note,
    }));
}
