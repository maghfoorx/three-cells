import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("pages/home/index.tsx"),

  layout("layouts/LoginPageLayout.tsx", [
    route("/login", "pages/login/index.tsx"),
  ]),

  layout("layouts/AuthenticatedAppLayout/AuthenticatedLayout.tsx", [
    route("/track", "pages/track/RedirectToTrackToday.tsx"),
    route("/track/:trackDate", "pages/track/index.tsx"),
    route("/log", "pages/log/index.tsx"),
    route("/settings", "pages/settings/index.tsx"),
  ]),
] satisfies RouteConfig;
