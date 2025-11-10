import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  // Your other tables...

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Derived fields
    hasCompletedOnboarding: v.boolean(),
    isSubscribed: v.boolean(), // true if they have an active subscription
    hasLifetimeAccess: v.boolean(), // true if they ever bought lifetime
    subscriptionExpiresAt: v.optional(v.union(v.number(), v.null())), // timestamp for current sub expiry
    timezone: v.optional(v.union(v.string(), v.null())),

    stripeUserId: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("stripeUserId", ["stripeUserId"]),
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
    score: v.float64(),

    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_userId_date_for", ["userId", "dateFor"]),

  userHabits: defineTable({
    userId: v.id("users"),

    name: v.string(),
    description: v.optional(v.string()),
    colour: v.string(), // hex format

    habitQuestion: v.string(),

    // "yes_no", "number", "timer", "custom", etc.
    type: v.union(
      v.literal("yes_no"),
      v.literal("number"),
      v.literal("custom"),
    ),

    // flexible recurrence rules
    frequency: v.object({
      mode: v.union(
        v.literal("daily"),
        v.literal("interval"),
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("custom"),
      ),

      interval: v.optional(v.number()), // e.g. every N days (interval)
      timesPerPeriod: v.optional(v.number()), // e.g. 3x/week or 5x/month
      daysOfWeek: v.optional(
        v.array(
          v.union(
            v.literal("mon"),
            v.literal("tue"),
            v.literal("wed"),
            v.literal("thu"),
            v.literal("fri"),
            v.literal("sat"),
            v.literal("sun"),
          ),
        ),
      ),
      startDate: v.optional(v.number()), // ISO date (for calculating next occurrences)
    }),

    enableNotifications: v.optional(v.boolean()), // whether to send notifications for this habit
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  userHabitSubmissions: defineTable({
    userId: v.id("users"),

    habitId: v.id("userHabits"),

    submittedAt: v.number(),

    dateFor: v.string(),

    // The actual submission data
    // For yes_no: true or false
    // For number: a numeric value (e.g., 20 pushups)
    // For custom: any custom input (could be text or number depending on your use case)
    value: v.union(
      v.boolean(), // for yes_no
      v.number(), // for number
      v.string(), // for custom
    ),

    note: v.optional(v.string()), // optional notes per submission (e.g., "felt tired", "extra session")

    // Track updates
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_habit", ["userId", "habitId"])
    .index("by_user_and_habit_and_date", ["userId", "habitId", "dateFor"])
    .index("by_user_date", ["userId", "dateFor"]),

  userPurchases: defineTable({
    userId: v.id("users"),

    // What they bought (e.g. "lifetime", "ai_monthly", "ai_yearly")
    product: v.string(),

    // How it's billed (e.g. "one_time", "subscription")
    billingType: v.union(v.literal("one_time"), v.literal("subscription")),

    // Where the payment happened (optional)
    provider: v.optional(v.string()), // e.g., "stripe", "paddle"
    providerId: v.optional(v.string()), // e.g., payment intent ID or subscription ID

    // When it was purchased
    purchasedAt: v.number(),

    // Used only for subscriptions
    expiresAt: v.optional(v.number()), // null for lifetime

    // Indicates if the purchase is currently active
    isActive: v.boolean(),

    // Useful for updates
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  userMetrics: defineTable({
    userId: v.id("users"),

    name: v.string(), // e.g., "Weight", "Focus Hours"
    unit: v.optional(v.string()), // e.g., "kg", "hours", "words"

    // Optional formatting hints for the UI
    increment: v.optional(v.float64()), // e.g., 0.1 step size
    valueType: v.optional(v.union(v.literal("float"), v.literal("integer"))), // UI formatting only

    colour: v.string(), // hex format

    isArchived: v.optional(v.boolean()), // hide from dashboard if archived

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  userMetricSubmissions: defineTable({
    userId: v.id("users"),
    metricId: v.id("userMetrics"),

    dateFor: v.string(), // e.g., "2025-07-17"
    submittedAt: v.number(), // precise timestamp

    value: v.float64(), // stored as float for all cases
    note: v.optional(v.string()),

    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_metric", ["userId", "metricId"])
    .index("by_user_metric_date", ["userId", "metricId", "dateFor"]) // enforce one per day
    .index("by_user_date", ["userId", "dateFor"]),

  user_onboarding_answers: defineTable({
    userId: v.id("users"),
    motivationReason: v.string(),
    selectedCateogires: v.array(v.string()),
  }).index("by_user", ["userId"]),

  stripePrices: defineTable({
    product: v.string(),
    amount: v.number(),
    currency: v.string(),
    stripeProductId: v.optional(v.string()),
    stripePriceId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_product", ["product"])
    .index("by_stripePriceId", ["stripePriceId"]),
});

export default schema;
