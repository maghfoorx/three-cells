import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  // Your other tables...

  user_tasks: defineTable({
    userId: v.id("users"),
    category_id: v.optional(v.id("user_tasks_categories")),
    description: v.optional(v.string()),
    is_completed: v.boolean(),
    title: v.string(),

    updated_at: v.number(),

    completed_at: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  user_tasks_categories: defineTable({
    id: v.id("user_tasks_categories"),
    userId: v.id("users"),
    name: v.string(),
    colour: v.optional(v.string()),
  }),

  three_cells: defineTable({
    userId: v.id("users"),
    dateFor: v.string(),
    summary: v.string(),
    focusedHours: v.float64(),
    score: v.float64(),

    updatedAt: v.number(),
  })
    .index("by_userId_date_for", ["userId", "dateFor"])
    .index("by_userId", ["userId"]),
});

export default schema;
