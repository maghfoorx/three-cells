import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internalMutationGeneric } from "convex/server";

export const savePurchase = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    stripeId: v.string(),
    paymentId: v.string(),
    product: v.string(), // e.g. "lifetime"
  },
  handler: async (ctx, args) => {
    console.log("running-the-insert-brother");
    console.log(
      {
        userId: args.userId,
        stripeId: args.stripeId,
        paymentId: args.paymentId,
      },
      "VARIABLES",
    );

    await ctx.db.patch(args.userId, {
      ...(args.product === "lifetime"
        ? { hasLifetimeAccess: true }
        : { isSubscribed: true }),
    });

    await ctx.db.insert("userPurchases", {
      userId: args.userId as Id<"users">,
      product: args.product,
      billingType: args.product === "lifetime" ? "one_time" : "subscription",
      provider: "stripe",
      providerId: args.stripeId,
      purchasedAt: Date.now(),
      isActive: true,
    });
  },
});

export const updateStripeSubscription = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    product: v.union(
      v.literal("yearly"),
      v.literal("monthly"),
      v.literal("lifetime"),
    ),
    stripeCustomerId: v.string(),
    expiresAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    if (args.product === "lifetime") {
      await ctx.db.patch(userId, {
        hasLifetimeAccess: true,
        stripeUserId: args.stripeCustomerId,
      });
    } else if (["monthly", "yearly"].includes(args.product)) {
      await ctx.db.patch(userId, {
        isSubscribed: true,
        subscriptionExpiresAt:
          args.expiresAt != null ? args.expiresAt : undefined,
        stripeUserId: args.stripeCustomerId,
      });
    }
  },
});

export const updateRevenueCatSubscription = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    productId: v.union(
      v.literal("com.threecells.weekly"),
      v.literal("com.threecells.weekly.notrial"),
      v.literal("com.threecells.lifetime"),
      v.literal("com.threecells.yearly.new"),
    ),
    expiresAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    if (args.productId === "com.threecells.lifetime") {
      await ctx.db.patch(userId, {
        hasLifetimeAccess: true,
      });
    } else if (
      [
        "com.threecells.weekly",
        "com.threecells.weekly.notrial",
        "com.threecells.yearly.new",
      ].includes(args.productId)
    ) {
      await ctx.db.patch(userId, {
        isSubscribed: true,
        subscriptionExpiresAt:
          args.expiresAt != null ? args.expiresAt : undefined,
      });
    }
  },
});

export const unsubscribeStripeSubscription = internalMutationGeneric({
  args: {
    stripeUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("stripeUserId", (q) => q.eq("stripeUserId", args.stripeUserId))
      .first();

    if (!user) {
      // No user found — safely exit
      console.warn(
        `User with stripe id ${args.stripeUserId} not found. Skipping unsubscribe.`,
      );
      return;
    }

    await ctx.db.patch(user._id, {
      isSubscribed: false,
      subscriptionExpiresAt: null,
    });
  },
});

export const unsubscribeRevenueCatSubscription = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    productId: v.union(
      v.literal("com.threecells.weekly"),
      v.literal("com.threecells.weekly.notrial"),
      v.literal("com.threecells.lifetime"),
      v.literal("com.threecells.yearly.new"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    const user = await ctx.db.get(userId);

    if (!user) {
      // No user found — safely exit
      console.warn(`User ${userId} not found. Skipping unsubscribe.`);
      return;
    }

    if (args.productId === "com.threecells.lifetime") {
      await ctx.db.patch(userId, {
        hasLifetimeAccess: false,
      });
    } else if (
      [
        "com.threecells.weekly",
        "com.threecells.weekly.notrial",
        "com.threecells.yearly.new",
      ].includes(args.productId)
    ) {
      await ctx.db.patch(userId, {
        isSubscribed: false,
        subscriptionExpiresAt: null,
      });
    }
  },
});
