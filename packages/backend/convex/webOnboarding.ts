import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOnboardingState = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const onboardingState = await ctx.db
            .query("webOnboarding")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        return onboardingState;
    },
});

export const updateOnboardingStep = mutation({
    args: {
        step: v.number(),
        data: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existingState = await ctx.db
            .query("webOnboarding")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (existingState) {
            await ctx.db.patch(existingState._id, {
                currentStep: args.step,
                data: { ...existingState.data, ...args.data },
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("webOnboarding", {
                userId,
                currentStep: args.step,
                data: args.data || {},
                isCompleted: false,
                updatedAt: Date.now(),
            });
        }
    },
});

export const completeOnboarding = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existingState = await ctx.db
            .query("webOnboarding")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .unique();

        if (existingState) {
            await ctx.db.patch(existingState._id, {
                isCompleted: true,
                updatedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("webOnboarding", {
                userId,
                currentStep: 5, // Assuming 5 steps
                data: {},
                isCompleted: true,
                updatedAt: Date.now(),
            });
        }

        // Also update the user record as requested
        await ctx.db.patch(userId, {
            webOnboardingCompleted: true,
        });
    },
});
