import { ConvexError, v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

export const pay = action({
  args: { product: v.union(v.literal("lifetime")) },
  handler: async (ctx, { product }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in view habits");
    }

    const domain = process.env.SITE_URL ?? "http://localhost:5173";
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-05-28.basil",
    });

    const priceIds: Record<string, string> = {
      lifetime: process.env.LIFETIME_PRICE_ID!,
      ai: process.env.AI_MONTHLY_PRICE_ID!, // optional for future use
    };

    const priceId = priceIds[product];
    if (!priceId) throw new Error("Unknown product");

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: product === "lifetime" ? "payment" : "subscription",
      success_url: `${domain}/track`,
      cancel_url: `${domain}/track`,
      metadata: {
        userId: userId,
        product,
      },
    });

    return session.url;
  },
});

export const fulfill = internalAction({
  args: { signature: v.string(), payload: v.string() },
  handler: async (ctx, { signature, payload }) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-05-28.basil",
    });

    const webhookSecret = process.env.STRIPE_WEBHOOKS_SECRET as string;
    try {
      const event = await stripe.webhooks.constructEventAsync(
        payload,
        signature,
        webhookSecret
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(session, "STRIPE_WEBHOOK_SESSION");

        const stripeId = session.id;
        const userId = session.metadata?.userId as Id<"users">;
        const product = session.metadata?.product;

        if (!userId || !product) {
          throw new Error("Missing metadata on session");
        }

        await ctx.runMutation(internal.internal.payments.savePurchase, {
          userId,
          stripeId,
          paymentId: session.payment_intent as string,
          product,
        });
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});
