import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from "@mdx-js/rollup";

import remarkGfm from "remark-gfm";

export default defineConfig({
  plugins: [mdx({ remarkPlugins: [remarkGfm] }), tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: { noExternal: ["styled-components"] },
});
