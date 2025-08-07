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
  subMonths,
  subWeeks,
  startOfDay,
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

export const getSingleHabit = query({
  args: {
    id: v.id("userHabits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const habit = await ctx.db.get(args.id);

    return habit;
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
          .lte("dateFor", args.end),
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
          .lte("dateFor", todayStr),
      )
      .collect();

    const submittedDates = currentMonthSubmissions.map((s) =>
      parseISO(s.dateFor),
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
        currentMonthPerformancePercentage.toFixed(0),
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
          .eq("dateFor", args.dateFor),
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
        q.eq("userId", userId).eq("habitId", args.habitId),
      )
      .collect();

    const existingDatesSet = new Set(
      existingSubmissions.map((submission) => submission.dateFor),
    );

    const now = Date.now();

    // Filter only dates that don't already have a submission
    const newDates = args.selectedDates.filter(
      (date) => !existingDatesSet.has(date),
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
      }),
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
        q.eq("userId", userId).eq("habitId", args.habitId),
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
      (date) => submissionsByDate[date],
    );

    // Delete each one
    const deletePromises = datesToDelete.map((date) =>
      ctx.db.delete(submissionsByDate[date]._id),
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
      return null;
    }

    const allSubmissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId),
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
    100,
  );
  const monthProgress = Math.min(
    Math.round((thisMonthSubmissions.length / 30) * 100),
    100,
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
      (a, b) => new Date(a.dateFor).getTime() - new Date(b.dateFor).getTime(),
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
      (a, b) => new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime(),
    )
    .slice(0, 7)
    .map((submission) => ({
      id: submission._id,
      dateFor: submission.dateFor,
      value: submission.value,
      note: submission.note,
    }));
}

// Delete habit mutation
export const deleteHabit = mutation({
  args: {
    habitId: v.id("userHabits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) {
      throw new ConvexError("Habit not found or unauthorized");
    }

    const submissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId),
      )
      .collect();

    for (const submission of submissions) {
      await ctx.db.delete(submission._id);
    }

    await ctx.db.delete(args.habitId);
    return habit;
  },
});

// Update habit mutation
export const updateHabit = mutation({
  args: {
    habitId: v.id("userHabits"),
    name: v.string(),
    colour: v.string(),
    habitQuestion: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) {
      throw new ConvexError("Habit not found or unauthorized");
    }

    await ctx.db.patch(args.habitId, {
      name: args.name,
      colour: args.colour,
      habitQuestion: args.habitQuestion,
      updatedAt: Date.now(),
    });

    return {
      ...habit,
      name: args.name,
      colour: args.colour,
      habitQuestion: args.habitQuestion,
      updatedAt: Date.now(),
    };
  },
});

export const getWeeklyPerformance = query({
  args: {
    habitId: v.id("userHabits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const now = new Date();
    const weeks = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }); // Monday start
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      const weekStartStr = format(weekStart, "yyyy-MM-dd");
      const weekEndStr = format(weekEnd, "yyyy-MM-dd");

      // Get submissions for this week
      const submissions = await ctx.db
        .query("userHabitSubmissions")
        .withIndex("by_user_and_habit_and_date", (q) =>
          q
            .eq("userId", userId)
            .eq("habitId", args.habitId)
            .gte("dateFor", weekStartStr)
            .lte("dateFor", weekEndStr),
        )
        .collect();

      // Calculate completion rate for the week
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const submittedDates = submissions.map((s) => parseISO(s.dateFor));

      let completedDays = 0;
      for (const day of daysInWeek) {
        if (day <= now && submittedDates.some((s) => isSameDay(s, day))) {
          completedDays++;
        }
      }

      // Only count days up to today for current week
      const relevantDays = daysInWeek.filter((day) => day <= now);
      const completionRate =
        relevantDays.length > 0
          ? (completedDays / relevantDays.length) * 100
          : 0;

      weeks.push({
        date: weekStart.getTime(),
        value: Math.round(completionRate),
        label: format(weekStart, "MMM d"),
      });
    }

    return weeks;
  },
});

export const getMonthlyPerformance = query({
  args: {
    habitId: v.id("userHabits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    const now = new Date();
    const months = [];

    // Get last 6 months of data
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);

      const monthStartStr = format(monthStart, "yyyy-MM-dd");
      const monthEndStr = format(monthEnd, "yyyy-MM-dd");

      // Get submissions for this month
      const submissions = await ctx.db
        .query("userHabitSubmissions")
        .withIndex("by_user_and_habit_and_date", (q) =>
          q
            .eq("userId", userId)
            .eq("habitId", args.habitId)
            .gte("dateFor", monthStartStr)
            .lte("dateFor", monthEndStr),
        )
        .collect();

      // Calculate completion rate for the month
      const daysInMonth = eachDayOfInterval({
        start: monthStart,
        end: monthEnd,
      });
      const submittedDates = submissions.map((s) => parseISO(s.dateFor));

      let completedDays = 0;
      for (const day of daysInMonth) {
        if (day <= now && submittedDates.some((s) => isSameDay(s, day))) {
          completedDays++;
        }
      }

      // Only count days up to today for current month
      const relevantDays = daysInMonth.filter((day) => day <= now);
      const completionRate =
        relevantDays.length > 0
          ? (completedDays / relevantDays.length) * 100
          : 0;

      months.push({
        date: monthStart.getTime(),
        value: Math.round(completionRate),
        label: format(monthStart, "MMM"),
      });
    }

    return months;
  },
});

// Add this query to your habits.ts file in convex

export const getStreaksData = query({
  args: {
    habitId: v.id("userHabits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in to view habits");
    }

    // Get all submissions for this habit, ordered by date
    const submissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_and_habit", (q) =>
        q.eq("userId", userId).eq("habitId", args.habitId),
      )
      .collect();

    // Sort by date
    const sortedSubmissions = submissions
      .map((s) => ({
        ...s,
        dateObj: parseISO(s.dateFor),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    if (sortedSubmissions.length === 0) {
      return {
        currentStreak: 0,
        topStreaks: [],
        isCurrentStreakActive: false,
      };
    }

    // Calculate all streaks
    const streaks: { length: number; startDate: Date; endDate: Date }[] = [];
    let currentStreakLength = 0;
    let currentStreakStart: Date | null = null;
    let previousDate: Date | null = null;

    for (const submission of sortedSubmissions) {
      const currentDate = submission.dateObj;

      if (previousDate === null) {
        // First submission
        currentStreakLength = 1;
        currentStreakStart = currentDate;
      } else {
        const daysDiff = differenceInDays(currentDate, previousDate);

        if (daysDiff === 1) {
          // Consecutive day
          currentStreakLength++;
        } else {
          // Streak broken, save the previous streak
          if (currentStreakStart && currentStreakLength > 0) {
            streaks.push({
              length: currentStreakLength,
              startDate: currentStreakStart,
              endDate: previousDate,
            });
          }
          // Start new streak
          currentStreakLength = 1;
          currentStreakStart = currentDate;
        }
      }

      previousDate = currentDate;
    }

    // Don't forget the last streak
    if (currentStreakStart && currentStreakLength > 0 && previousDate) {
      streaks.push({
        length: currentStreakLength,
        startDate: currentStreakStart,
        endDate: previousDate,
      });
    }

    // Check if current streak is still active (last submission was yesterday or today)
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = subDays(today, 1);
    const lastSubmissionDate =
      sortedSubmissions[sortedSubmissions.length - 1]?.dateObj;

    const isCurrentStreakActive =
      lastSubmissionDate &&
      (isSameDay(lastSubmissionDate, today) ||
        isSameDay(lastSubmissionDate, yesterday));

    // Current streak is the last streak if it's active, otherwise 0
    const currentStreak =
      isCurrentStreakActive && streaks.length > 0
        ? streaks[streaks.length - 1].length
        : 0;

    // Get top 5 streaks (sorted by length, then by end date)
    const topStreaks = streaks
      .sort((a, b) => {
        if (b.length !== a.length) return b.length - a.length;
        return b.endDate.getTime() - a.endDate.getTime();
      })
      .slice(0, 5)
      .map((streak) => ({
        length: streak.length,
        startDate: streak.startDate.getTime(),
        endDate: streak.endDate.getTime(),
        isCurrentStreak:
          isCurrentStreakActive && streak === streaks[streaks.length - 1],
      }));

    return {
      currentStreak,
      topStreaks,
      isCurrentStreakActive: isCurrentStreakActive,
    };
  },
});

export const getHabitsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get all user habits
    const userHabits = await ctx.db
      .query("userHabits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get submissions for the specific date
    const submissions = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("dateFor", date),
      )
      .collect();

    // Filter completed habits based on submission value
    const completedHabits = [];
    for (const submission of submissions) {
      const habit = userHabits.find((h) => h._id === submission.habitId);
      if (habit) {
        // Consider habit completed if:
        // - yes_no type and value is true
        // - number/custom type and value is greater than 0
        const isCompleted =
          (habit.type === "yes_no" && submission.value === true) ||
          ((habit.type === "number" || habit.type === "custom") &&
            typeof submission.value === "number" &&
            submission.value > 0) ||
          (habit.type === "custom" &&
            typeof submission.value === "string" &&
            submission.value.length > 0);

        if (isCompleted) {
          completedHabits.push({
            name: habit.name,
            colour: habit.colour,
          });
        }
      }
    }

    return completedHabits;
  },
});
