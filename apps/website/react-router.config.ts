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

    // spa fallback shell
    "/__app_shell",
  ],
} satisfies Config;
