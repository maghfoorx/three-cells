import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";
import { lazy } from "react";

const SingleHabitPageLazy = lazy(() => import("./pages/singleHabitPage/index"));

export default [
  index("pages/home/index.tsx"),

  layout("layouts/LoginPageLayout.tsx", [
    route("/login", "pages/login/index.tsx"),
  ]),

  layout("layouts/AuthenticatedAppLayout/AuthenticatedLayout.tsx", [
    // three cells pages
    route("/track", "pages/track/RedirectToTrackToday.tsx"),
    route("/track/:trackDate", "pages/track/index.tsx"),
    route("/log", "pages/log/index.tsx"),
    route("/settings", "pages/settings/index.tsx"),
    route("/yearly-view", "pages/calendarView/index.tsx"),

    // tasks pages
    route("/tasks", "pages/tasks/index.tsx"),

    // habits pages
    route("/habits", "pages/habits/index.tsx"),
    route("/habits/:habitId", "pages/singleHabitPage/index.tsx"),

    // metrics pages
    route("/metrics", "pages/metrics/index.tsx"),
    route("/metrics/:metricId", "pages/singleMetricPage/index.tsx"),
  ]),

  layout("layouts/LegalPagesLayout.tsx", [
    route("/privacy", "pages/privacy/index.tsx"),
    route("/terms", "pages/terms/index.tsx"),
  ]),
] satisfies RouteConfig;
