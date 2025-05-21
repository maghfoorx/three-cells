import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getGitShaValue = query({
  args: {},
  handler: async (ctx) => {
    const gitShaValue = process.env.GIT_SHA;

    console.log(process.env.GIT_SHA, "GIT_SHA VALUE");

    return gitShaValue;
  },
});
