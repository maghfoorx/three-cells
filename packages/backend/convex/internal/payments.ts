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

export const updateRevenueCatSubscription = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    productId: v.union(
      v.literal("com.threecells.weekly"),
      v.literal("com.threecells.weekly.notrial"),
      v.literal("com.threecells.lifetime"),
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
      ["com.threecells.weekly", "com.threecells.weekly.notrial"].includes(
        args.productId,
      )
    ) {
      await ctx.db.patch(userId, {
        isSubscribed: true,
        subscriptionExpiresAt:
          args.expiresAt != null ? args.expiresAt : undefined,
      });
    }
  },
});

export const unsubscribeRevenueCatSubscription = internalMutationGeneric({
  args: {
    userId: v.id("users"),
    productId: v.union(
      v.literal("com.threecells.weekly"),
      v.literal("com.threecells.weekly.notrial"),
      v.literal("com.threecells.lifetime"),
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
      ["com.threecells.weekly", "com.threecells.weekly.notrial"].includes(
        args.productId,
      )
    ) {
      await ctx.db.patch(userId, {
        isSubscribed: false,
        subscriptionExpiresAt: null,
      });
    }
  },
});
