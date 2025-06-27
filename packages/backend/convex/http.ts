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

export default http;
