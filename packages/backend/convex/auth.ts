import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

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
      console.log(params.redirectTo, "REDIRECT_TO_PASSED");
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
  },
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
