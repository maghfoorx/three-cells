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

    const tasks = await ctx.db
      .query("user_tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return tasks.sort(
      (a, b) => Number(a.is_completed) - Number(b.is_completed),
    );
  },
});

export const getSingleTask = query({
  args: { id: v.id("user_tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("You must be logged in to view tasks.");
    }

    const task = await ctx.db
      .query("user_tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("_id"), args.id))
      .unique();

    return task;
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

export const updateTask = mutation({
  args: {
    id: v.id("user_tasks"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new ConvexError("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      updated_at: Date.now(),
    });

    return {
      ...task,
      title: args.title,
      description: args.description,
      updated_at: Date.now(),
    };
  },
});

export const getTasksForDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const targetDate = new Date(date);
    const startOfDay = targetDate.getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1; // End of day

    const completedTasks = await ctx.db
      .query("user_tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("is_completed"), true),
          q.neq(q.field("completed_at"), undefined),
          q.gte(q.field("completed_at"), startOfDay),
          q.lte(q.field("completed_at"), endOfDay),
        ),
      )
      .collect();

    return completedTasks.length;
  },
});
