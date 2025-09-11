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
