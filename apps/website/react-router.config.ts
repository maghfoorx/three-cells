import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  prerender: [
    "/",
    "/privacy",
    "/terms",

    // blog post pages
    "/blog",
    "/blog/habit",
    "/blog/notion",
    "/blog/28-books",
    "/blog/one-resolution",
    "/blog/8-months",
    "/blog/must-journal",
    "/blog/dont-procrastinate",

    // spa fallback shell
    "/__app_shell",
  ],
} satisfies Config;
