import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { components } from "../_generated/api.js";
import { internalMutation, mutation } from "../_generated/server.js";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const pushNotifications = new PushNotifications(components.pushNotifications);

export const recordPushNotificationToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return;

    await pushNotifications.recordToken(ctx, {
      userId,
      pushToken: args.token,
    });
  },
});

export const checkAndSendHabitReminders = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // only send to users that have lifetime access or are subscribed
      if (!user.timezone || (!user.isSubscribed && !user.hasLifetimeAccess))
        continue;

      // Get user’s notification status
      const status = await pushNotifications.getStatusForUser(ctx, {
        userId: user._id,
      });

      // Skip users who don’t have notifications enabled
      if (!status?.hasToken || status?.paused) continue;

      const localTime = dayjs().tz(user.timezone);

      // if it's not 8pm for the user continue
      if (localTime.hour() !== 20) continue;

      const today = localTime.format("YYYY-MM-DD");

      // Get all user's habits
      const habits = await ctx.db
        .query("userHabits")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      if (habits.length === 0) continue;

      // Get today's submissions
      const submissions = await ctx.db
        .query("userHabitSubmissions")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", user._id).eq("dateFor", today),
        )
        .collect();

      // Map submitted habit IDs
      const submittedHabitIds = new Set(
        submissions.map((s) => s.habitId.toString()),
      );

      // Filter habits that are NOT submitted today AND have notifications enabled
      const incompleteHabits = habits.filter(
        (h) =>
          !submittedHabitIds.has(h._id.toString()) &&
          h?.enableNotifications === true,
      );

      if (incompleteHabits.length === 0) continue;

      let subtitle: string;
      if (incompleteHabits.length === 1) {
        // Only one habit left → use habit question
        subtitle = incompleteHabits[0].habitQuestion;
      } else {
        // Multiple habits left → generic reminder
        subtitle = `Reminder to complete your ${incompleteHabits.length} habits today!`;
      }

      await pushNotifications.sendPushNotification(ctx, {
        userId: user._id,
        notification: {
          title: "Habits Reminder",
          subtitle,
          sound: "default",
        },
      });

      console.log(`Sent reminder to ${user.email} (${user.timezone})`);
    }
  },
});
