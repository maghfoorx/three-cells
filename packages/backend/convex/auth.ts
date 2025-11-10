import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Apple({
      profile: (appleInfo) => {
        const name = appleInfo.user
          ? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
          : undefined;
        return {
          id: appleInfo.sub,
          name: name,
          email: appleInfo.email,
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    redirect: async (params: { redirectTo: string }) => {
      if (params.redirectTo === "http://localhost:8081") {
        return params.redirectTo;
      }

      if (params.redirectTo === "com.threecells.iosapp://") {
        return params.redirectTo;
      }

      if (params.redirectTo.startsWith(process.env.SITE_URL!)) {
        return params.redirectTo;
      }
      if (params.redirectTo.startsWith("/")) {
        return `${process.env.SITE_URL}${params.redirectTo}`;
      }

      return process.env.SITE_URL!;
    },
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      if (args.profile.email) {
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), args.profile.email))
          .first();

        if (existingUser) {
          return existingUser._id;
        }
      }

      // No existing user found, create a new one
      const userId = await ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name ?? "Anonymous",
        image: args.profile?.image ?? args.profile?.image ?? undefined,

        isSubscribed: false,
        hasLifetimeAccess: false,
        hasCompletedOnboarding: false,
      });

      return userId;
    },
  },
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

export const internalViewerQuery = internalQuery({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

export const setStripeId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      stripeUserId: args.stripeUserId,
    });
  },
});

export const setUserTimezone = mutation({
  args: {
    timezoneInput: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("You must be logged in to create a metric");
    }

    await ctx.db.patch(userId, {
      timezone: args.timezoneInput,
    });

    const user = await ctx.db.get(userId);

    return user;
  },
});

export const completeUserOnboarding = mutation({
  args: {
    motivationReason: v.string(),
    selectedCategories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("You must be logged in to create a metric");
    }

    await ctx.db.patch(userId, {
      hasCompletedOnboarding: true,
    });

    await ctx.db.insert("user_onboarding_answers", {
      userId: userId,
      motivationReason: args.motivationReason,
      selectedCateogires: args.selectedCategories,
    });

    const user = await ctx.db.get(userId);

    return user;
  },
});

export const deleteUserAccount = mutation({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("You must be logged in to delete your account");
    }

    const tablesToDelete = [
      "user_tasks",
      "user_tasks_categories",
      "three_cells",
      "userHabits",
      "userHabitSubmissions",
      "userPurchases",
      "userMetrics",
      "userMetricSubmissions",
      "user_onboarding_answers",
    ];

    // Delete user-related records in custom tables
    for (const table of tablesToDelete) {
      const docs = await ctx.db
        .query(table as any)
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
        .catch(() => []); // some tables may not have "by_user" index

      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }

    // Delete authAccounts
    const authAccounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();

    for (const account of authAccounts) {
      await ctx.db.delete(account._id);
    }

    // Delete authSessions
    const authSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    for (const session of authSessions) {
      // Delete refresh tokens linked to this session
      const refreshTokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const token of refreshTokens) {
        await ctx.db.delete(token._id);
      }

      // Now delete the session itself
      await ctx.db.delete(session._id);
    }

    // Finally, delete the user
    await ctx.db.delete(userId);
  },
});

function toCSV(headers: string[], rows: any[][]): string {
  const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`; // safe escaping
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join(
    "\n",
  );
}

export const exportUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("You must be logged in to delete your account");
    }

    // --- three_cells
    const threeCells = await ctx.db
      .query("three_cells")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const threeCellsCsv = toCSV(
      ["dateFor", "summary", "score"],
      threeCells.map((c) => [c.dateFor, c.summary, c.score]),
    );

    // --- habits submissions
    const habitSubs = await ctx.db
      .query("userHabitSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const habits = await ctx.db
      .query("userHabits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const habitMap = Object.fromEntries(habits.map((h) => [h._id, h.name]));

    // --- metric submissions
    const metricSubs = await ctx.db
      .query("userMetricSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const metrics = await ctx.db
      .query("userMetrics")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const metricMap = Object.fromEntries(
      metrics.map((m) => [m._id, { name: m.name, unit: m.unit }]),
    );

    // --- habits submissions grouped by habit
    const habitSubsGrouped = Object.values(
      habitSubs.reduce(
        (acc, sub) => {
          const habitName = habitMap[sub.habitId] ?? "Unknown";
          if (!acc[habitName]) acc[habitName] = [];
          acc[habitName].push(sub);
          return acc;
        },
        {} as Record<string, typeof habitSubs>,
      ),
    );

    const habitCsvLines: string[][] = [];
    for (const group of habitSubsGrouped) {
      const habitName = habitMap[group[0].habitId] ?? "Unknown";
      habitCsvLines.push([`=== ${habitName} ===`]); // optional section header
      habitCsvLines.push(["dateFor", "value"]); // CSV headers per habit
      for (const sub of group) {
        habitCsvLines.push([sub.dateFor, sub.value.toString()]);
      }
      habitCsvLines.push([]); // empty line between habits
    }

    const habitCsv = habitCsvLines.map((r) => r.join(",")).join("\n");

    // --- metric submissions grouped by metric
    const metricSubsGrouped = Object.values(
      metricSubs.reduce(
        (acc, sub) => {
          const metricName = metricMap[sub.metricId]?.name ?? "Unknown";
          if (!acc[metricName]) acc[metricName] = [];
          acc[metricName].push(sub);
          return acc;
        },
        {} as Record<string, typeof metricSubs>,
      ),
    );

    const metricCsvLines: string[][] = [];
    for (const group of metricSubsGrouped) {
      const metricName = metricMap[group[0].metricId]?.name ?? "Unknown";
      const unit = metricMap[group[0].metricId]?.unit ?? "";
      metricCsvLines.push([`=== ${metricName} (${unit}) ===`]); // optional section header
      metricCsvLines.push(["dateFor", "value"]);
      for (const sub of group) {
        metricCsvLines.push([sub.dateFor, sub.value.toString()]);
      }
      metricCsvLines.push([]); // empty line between metrics
    }

    const metricCsv = metricCsvLines.map((r) => r.join(",")).join("\n");

    return {
      threeCellsCsv,
      habitCsv,
      metricCsv,
    };
  },
});
