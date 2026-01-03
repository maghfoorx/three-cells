import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";
import { lazy } from "react";
import { redirect } from "react-router";
import { Navigate } from "react-router";

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

  route("/onboarding", "pages/onboarding/index.tsx"),

  layout("layouts/LegalPagesLayout.tsx", [
    route("/privacy", "pages/privacy/index.tsx"),
    route("/terms", "pages/terms/index.tsx"),
  ]),

  // web redirect for hackernews
  route("/web", "pages/web/index.tsx"),
  route("/web1", "pages/web/web1.tsx"),

  // blog psots

  layout("pages/blog/layout.tsx", [
    route("/blog", "pages/blog/index.tsx"),
    route("/blog/habit", "pages/blog/habit.tsx"),
    route("/blog/notion", "pages/blog/notion.tsx"),
    route("/blog/28-books", "pages/blog/28-books.tsx"),
    route("/blog/one-resolution", "pages/blog/one-resolution.tsx"),
    route("/blog/8-months", "pages/blog/8-months.tsx"),
    route("/blog/must-journal", "pages/blog/must-journal.tsx"),
    route("/blog/dont-procrastinate", "pages/blog/dont-procrastinate.tsx"),
    route("/blog/2026-best-life", "pages/blog/2026-best-life.tsx"),
  ]),

  // spa fallback shell
  route("/__app_shell", "pages/fallback/index.tsx"),
] satisfies RouteConfig;
