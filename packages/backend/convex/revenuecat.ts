import { ConvexError, v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { type Id } from "./_generated/dataModel";

type ProductIdentifier =
  | "com.threecells.weekly"
  | "com.threecells.weekly.notrial"
  | "com.threecells.lifetime";

// ----------------------
// Webhook handler
// ----------------------
export const fulfillRevenueCat = internalAction({
  args: { payload: v.any() },
  handler: async (ctx, { payload }) => {
    try {
      const _payload = JSON.parse(payload);

      const event = _payload.event;

      console.log(JSON.stringify(event), "REVENUE_CAT_EVENT");

      const productId = event.product_id as ProductIdentifier;

      const userId = event?.app_user_id as Id<"users">;
      if (!userId) throw new Error("Missing app_user_id in payload");

      switch (event.type) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
        case "ENTITLEMENT_PURCHASED":
          await ctx.runMutation(
            internal.internal.payments.updateRevenueCatSubscription,
            {
              userId,
              productId,
              expiresAt: event.expiration_at_ms as number | null,
            },
          );
          break;

        case "EXPIRED":
        case "ENTITLEMENT_REVOKED":
          await ctx.runMutation(
            internal.internal.payments.unsubscribeRevenueCatSubscription,
            {
              userId,
              productId,
            },
          );
          break;

        default:
          console.log("Unhandled RevenueCat event type:", event.type);
      }

      return { success: true };
    } catch (err) {
      console.error("RevenueCat webhook error:", err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

export const addSusbscription = mutation({
  args: {
    productId: v.union(
      v.literal("com.threecells.weekly"),
      v.literal("com.threecells.weekly.notrial"),
      v.literal("com.threecells.lifetime"),
    ),
    expiresAt: v.union(v.float64(), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new ConvexError("You must be logged in");
    }

    if (args.productId === "com.threecells.lifetime") {
      await ctx.db.patch(userId, {
        hasLifetimeAccess: true,
      });
    } else if (
      args.productId === "com.threecells.weekly" ||
      args.productId === "com.threecells.weekly.notrial"
    ) {
      await ctx.db.patch(userId, {
        isSubscribed: true,
        subscriptionExpiresAt:
          args.expiresAt != null ? args.expiresAt : undefined,
      });

      return await ctx.db.get(userId);
    }
  },
});
