import { defineApp } from "convex/server";
import migrations from "@convex-dev/migrations/convex.config";
import pushNotifications from "@convex-dev/expo-push-notifications/convex.config";
import crons from "@convex-dev/crons/convex.config";

const app = defineApp();
app.use(migrations);
app.use(pushNotifications);
app.use(crons);

export default app;
