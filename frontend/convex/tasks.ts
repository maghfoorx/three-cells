import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const getAllUserTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("You must be logged in to view tasks.");
    }

    return await ctx.db
      .query("user_tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createUserTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category_id: v.optional(v.id("user_tasks_categories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    return await ctx.db.insert("user_tasks", {
      userId,
      title: args.title,
      description: args.description,
      category_id: args.category_id,
      is_completed: false,
      updated_at: Date.now(),
    });
  },
});

export const toggleUserTaskCompletion = mutation({
  args: { taskId: v.id("user_tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    const is_completed = !task.is_completed;
    const completed_at = is_completed ? Date.now() : undefined;

    await ctx.db.patch(args.taskId, {
      is_completed,
      completed_at,
      updated_at: Date.now(),
    });

    return { ...task, is_completed, completed_at };
  },
});

export const deleteUserTask = mutation({
  args: { taskId: v.id("user_tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    await ctx.db.delete(args.taskId);
    return task;
  },
});

export const updateTaskTitle = mutation({
  args: {
    taskId: v.id("user_tasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    await ctx.db.patch(args.taskId, { title: args.title });
    return { ...task, title: args.title };
  },
});
