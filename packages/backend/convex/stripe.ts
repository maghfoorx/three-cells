import { ConvexError, v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";

export const pay = action({
  args: {
    product: v.union(
      v.literal("lifetime"),
      v.literal("monthly"),
      v.literal("yearly"),
    ),
  },
  handler: async (ctx, { product }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new ConvexError("You must be logged in view habits");
    }

    // Get your user row from Convex.
    // NOTE: if your users table's document id isn't the auth id, replace this with your lookup.
    const user = (await ctx.runQuery(
      internal.auth.internalViewerQuery,
    )) as Doc<"users">;

    const domain = process.env.SITE_URL ?? "http://localhost:5173";
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-05-28.basil",
    });

    const priceIds: Record<string, string> = {
      lifetime: process.env.STRIPE_LIFETIME_PRICE_ID!,
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
    };

    const priceId = priceIds[product];
    if (!priceId) throw new Error("Unknown product");

    // Ensure we have a stripeCustomerId for this user (reuse if present)
    let stripeCustomerId = user?.stripeUserId ?? null;

    if (!stripeCustomerId) {
      // Create a Stripe Customer and save it back to the user row
      const createdCustomer = await stripe.customers.create({
        email: user?.email ?? undefined,
        metadata: { appUserId: userId },
        name: user?.name ?? undefined,
      });

      stripeCustomerId = createdCustomer.id;

      // Save the stripeUserId back to your DB
      await ctx.runMutation(internal.auth.setStripeId, {
        userId: user?._id,
        stripeUserId: stripeCustomerId,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: product === "lifetime" ? "payment" : "subscription",
      success_url: `${domain}/track`,
      cancel_url: `${domain}/track`,
      metadata: {
        userId: userId,
        product,
      },
      customer: stripeCustomerId,
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
        webhookSecret,
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const stripeCustomerId = session.customer as string;
        const userId = session.metadata?.userId as Id<"users">;
        const product = session.metadata?.product;

        if (!userId || !product) {
          throw new Error("Missing metadata on session");
        }

        if (["monthly", "yearly", "lifetime"].includes(product)) {
          await ctx.runMutation(
            internal.internal.payments.updateStripeSubscription,
            {
              userId,
              stripeCustomerId,
              product: product as any,
              expiresAt: null,
            },
          );
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const stripeCustomerId = event.data.object.customer;

        await ctx.runMutation(
          internal.internal.payments.unsubscribeStripeSubscription,
          {
            stripeUserId: stripeCustomerId as string,
          },
        );
      }
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: (err as { message: string }).message };
    }
  },
});

export const createPortalSession = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("You must be logged in");

    const user = await ctx.runQuery(internal.auth.internalViewerQuery);

    if (!user?.stripeUserId) {
      throw new Error("User does not have a Stripe customer ID");
    }

    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-05-28.basil",
    });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeUserId,
      return_url: process.env.SITE_URL + "/settings",
    });

    return portalSession.url;
  },
});

// Query to fetch cached prices
export const getPrices = query({
  args: {},
  handler: async (ctx) => {
    const prices = await ctx.db.query("stripePrices").collect();

    return {
      lifetime: prices.find((p) => p.product === "lifetime"),
      monthly: prices.find((p) => p.product === "monthly"),
      yearly: prices.find((p) => p.product === "yearly"),
    };
  },
});

export const syncPrices = internalAction({
  args: {},
  handler: async (ctx) => {
    const stripe = new Stripe(process.env.STRIPE_KEY!, {
      apiVersion: "2025-05-28.basil",
    });
    const priceIds = {
      lifetime: process.env.STRIPE_LIFETIME_PRICE_ID!,
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
    };

    console.log(priceIds, "PRICE_IDS");
    for (const [product, priceId] of Object.entries(priceIds)) {
      const price = await stripe.prices.retrieve(priceId);

      await ctx.runMutation(internal.stripe.storePrices, {
        product,
        amount: price.unit_amount!,
        currency: price.currency,
        stripePriceId: priceId,
        stripeProductId: price.product as string,
      });
    }
  },
});

export const storePrices = internalMutation({
  args: {
    product: v.string(),
    amount: v.number(),
    currency: v.string(),
    stripePriceId: v.string(),
    stripeProductId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stripePrices")
      .withIndex("by_product", (q) => q.eq("product", args.product))
      .first();
    const data = {
      ...args,
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("stripePrices", data);
    }
  },
});
