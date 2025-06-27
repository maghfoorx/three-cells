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
