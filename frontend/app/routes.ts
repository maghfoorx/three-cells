import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("pages/home/index.tsx"),

  layout("layouts/LoggedOutLayout.tsx", [
    route("/login", "pages/login/index.tsx"),
  ]),

  layout("layouts/ProtectedLayout.tsx", [
    route("/profile", "pages/profile/index.tsx"),
  ]),
] satisfies RouteConfig;
