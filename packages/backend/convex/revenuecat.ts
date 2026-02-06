import { ConvexError, v } from "convex/values";
import { internalAction, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { type Id } from "./_generated/dataModel";
import { sendPurchaseEvent } from "./analytics";

type ProductIdentifier =
  | "com.threecells.weekly"
  | "com.threecells.weekly.notrial"
  | "com.threecells.lifetime"
  | "com.threecells.yearly.new";

// ----------------------
// Webhook handler
// ----------------------
export const fulfillRevenueCat = internalAction({
  args: { payload: v.any() },
  handler: async (ctx, { payload }) => {
    try {
      const _payload = JSON.parse(payload);

      const event = _payload.event;
      const productId = event.product_id as ProductIdentifier;
      let userId = event?.app_user_id;

      if (!userId && event.type === "TRANSFER" && event.transferred_to) {
        userId = event.transferred_to.find(
          (id: string) => !id.startsWith("$RCAnonymousID"),
        );
      }

      userId = userId as Id<"users">;

      console.log(event.type, productId, userId, "REVENUE_CAT_EVENT");

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

          // Find user for analytics
          const userEmail = await ctx.runQuery(
            internal.internal.users.getUserEmail,
            {
              userId,
            },
          );

          // Send to Google Analytics
          const priceInPurchasedCurrency = event.price_in_purchased_currency;
          const currency = event.currency;
          const transactionId = event.transaction_id;
          console.log(event, "TEST_EVENTTTT");
          await sendPurchaseEvent({
            user_id: userId,
            email: userEmail ?? undefined,
            items: [
              {
                item_id: productId,
                item_name: productId,
              },
            ],
          });
          break;

        case "EXPIRED":
        case "EXPIRATION":
        case "ENTITLEMENT_REVOKED":
          await ctx.runMutation(
            internal.internal.payments.unsubscribeRevenueCatSubscription,
            {
              userId,
              productId,
            },
          );
          break;

        case "CANCELLATION":
          // if user refunds lifetime access
          if (productId === "com.threecells.lifetime") {
            await ctx.runMutation(
              internal.internal.payments.unsubscribeRevenueCatSubscription,
              {
                userId,
                productId,
              },
            );
          } else {
            console.log("Unhandled cancellation product:", productId);
          }
          break;
        case "NON_RENEWING_PURCHASE":
          if (productId === "com.threecells.lifetime") {
            await ctx.runMutation(
              internal.internal.payments.updateRevenueCatSubscription,
              {
                userId,
                productId,
                expiresAt: null,
              },
            );

            // Find user for analytics
            const userEmail = await ctx.runQuery(
              internal.internal.users.getUserEmail,
              {
                userId,
              },
            );

            await sendPurchaseEvent({
              user_id: userId,
              email: userEmail ?? undefined,
              items: [
                {
                  item_id: productId,
                  item_name: productId,
                },
              ],
            });
          } else {
            console.log("Unhandled non-renewing product:", productId);
          }
          break;

        case "TRANSFER":
          console.log("RevenueCat TRANSFER event", { userId, productId });
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
      v.literal("com.threecells.yearly.new"),
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
      args.productId === "com.threecells.weekly.notrial" ||
      args.productId === "com.threecells.yearly.new"
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
