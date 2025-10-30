import { PushNotifications } from "@convex-dev/expo-push-notifications";
import Promise from "bluebird";
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

// Choose concurrency based on observed latency & platform limits
const CONCURRENCY = 12;

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
    const startAll = Date.now();
    console.log("Reminder job started");

    // Fetch users (preferably use a DB index to restrict this in future)
    const users = await ctx.db.query("users").collect();
    console.log(`Fetched ${users.length} users from DB`);

    // Filter early: only users with timezone and subscription/lifetime access
    const candidates = users.filter(
      (u) => u.timezone && (u.isSubscribed || u.hasLifetimeAccess),
    );
    console.log(
      `Candidates after timezone/subscription filter: ${candidates.length}`,
    );

    // Use Bluebird to process users with concurrency limit.
    const results = await Promise.map(
      candidates,
      async (user) => {
        const userStart = Date.now();
        try {
          // Quick local time check before any external calls
          if (!user?.timezone) {
            return {
              user: user._id,
              skipped: true,
            };
          }

          const localTime = dayjs().tz(user.timezone);
          if (localTime.hour() !== 20) {
            // Not the user's 8pm local time — skip
            return { user: user._id, skipped: true };
          }

          // Get user’s notification status
          const status = await pushNotifications.getStatusForUser(ctx, {
            userId: user._id,
          });

          if (!status?.hasToken || status?.paused) {
            // No token or paused — skip
            return {
              user: user._id,
              skipped: true,
              reason: "no-token-or-paused",
            };
          }

          const today = localTime.format("YYYY-MM-DD");

          // Fetch habits and today's submissions in parallel
          const [habits, submissions] = await Promise.all([
            ctx.db
              .query("userHabits")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .collect(),
            ctx.db
              .query("userHabitSubmissions")
              .withIndex("by_user_date", (q) =>
                q.eq("userId", user._id).eq("dateFor", today),
              )
              .collect(),
          ]);

          if (!habits || habits.length === 0) {
            return { user: user._id, skipped: true, reason: "no-habits" };
          }

          const submittedHabitIds = new Set(
            (submissions || []).map((s) => s.habitId.toString()),
          );

          const incompleteHabits = habits.filter(
            (h) =>
              !submittedHabitIds.has(h._id.toString()) &&
              h?.enableNotifications === true,
          );

          if (!incompleteHabits || incompleteHabits.length === 0) {
            return {
              user: user._id,
              skipped: true,
              reason: "no-incomplete-habits",
            };
          }

          let subtitle: string;
          if (incompleteHabits.length === 1) {
            subtitle = incompleteHabits[0].habitQuestion;
          } else {
            subtitle = `Reminder to complete your ${incompleteHabits.length} habits today!`;
          }

          // Send the notification (await so we can catch failures per user)
          await pushNotifications.sendPushNotification(ctx, {
            userId: user._id,
            notification: {
              title: "Habits Reminder",
              subtitle,
              sound: "default",
            },
          });

          console.log(
            `Sent reminder to ${user.email} (${user.timezone}) in ${Date.now() - userStart}ms`,
          );
          return {
            user: user._id,
            sent: true,
            durationMs: Date.now() - userStart,
          };
        } catch (err) {
          console.error(`Error processing user ${user._id}:`, err);
          // Return an object describing the failure so Bluebird doesn't reject the whole map
          return { user: user._id, error: true, message: String(err) };
        }
      },
      { concurrency: CONCURRENCY },
    );

    // Summarize results
    const sent = results.filter((r) => (r as any).sent).length;
    const skipped = results.filter((r) => (r as any).skipped).length;
    const failed = results.filter((r) => (r as any).error).length;

    console.log(
      `Reminder job finished: sent=${sent}, skipped=${skipped}, failed=${failed}, totalMs=${Date.now() - startAll}`,
    );

    return { sent, skipped, failed }; // optional return if you want schedule logs to capture it
  },
});
