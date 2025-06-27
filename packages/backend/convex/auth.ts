import Google from "@auth/core/providers/google";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
});

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return null;

    const user = await ctx.db.get(userId);

    const purchases = await ctx.db
      .query("userPurchases")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activePurchase = purchases.find((p) => p.isActive);

    return {
      ...user,
      hasActivePurchase: !!activePurchase,
      activePurchase,
    };
  },
});
