import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("HELLO HITTING STRIPE HERE BROTHER");
    const signature: string = request.headers.get("stripe-signature") as string;
    const result = await ctx.runAction(internal.stripe.fulfill, {
      signature,
      payload: await request.text(),
    });
    if (result.success) {
      return new Response(null, {
        status: 200,
      });
    } else {
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const authHeader = request.headers.get("authorization") || "";
    console.log(process.env.REVENUE_CAT_WEBHOOK_SECRET, "SECRET_HAHA");
    if (authHeader !== process.env.REVENUE_CAT_WEBHOOK_SECRET) {
      return new Response("Unauthorized yo", { status: 401 });
    }

    const payload = await request.text();

    const result = await ctx.runAction(internal.revenuecat.fulfillRevenueCat, {
      payload,
    });

    return new Response(result.success ? null : "Webhook Error", {
      status: result.success ? 200 : 400,
    });
  }),
});

export default http;
