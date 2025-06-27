import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getGitShaValue = query({
  args: {},
  handler: async (ctx) => {
    const gitShaValue = process.env.GIT_SHA;

    return gitShaValue;
  },
});
