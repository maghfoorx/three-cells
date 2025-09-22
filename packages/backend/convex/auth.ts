import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
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

      console.log(args, "ARE_ARGS_FN_createOrUpdateUser");
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
