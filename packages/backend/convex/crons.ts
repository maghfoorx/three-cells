import { cronJobs } from "convex/server";
import { internal } from "./_generated/api.js";

const crons = cronJobs();

// runs every hour at 0 minutes
crons.hourly(
  "habit-reminder-check",
  { minuteUTC: 0 },
  internal.userNotifications.index.checkAndSendHabitReminders,
);

export default crons;
