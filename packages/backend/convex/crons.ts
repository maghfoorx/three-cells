import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

const crons = cronJobs();

// runs every hour at 0 minutes
crons.hourly(
  "habit-reminder-check",
  { minuteUTC: 0 },
  internal.userNotifications.index.checkAndSendHabitReminders,
);

crons.interval(
  "sync-stripe-prices",
  { hours: 168 }, // Sync every 7 days
  internal.stripe.syncPrices,
);

export default crons;
