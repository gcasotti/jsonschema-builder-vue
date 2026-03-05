import path from "node:path";
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";

const { publicVars } = loadEnv({ prefixes: ["PUBLIC_", "VITE_"] });

export default defineConfig({
  plugins: [pluginVue()],
  server: {
    host: "::",
    port: 8080,
  },
  output: {
    distPath: {
      root: "dist-demo",
    },
  },
  source: {
    entry: {
      index: "./demo/main.ts",
    },
    define: {
      ...publicVars,
      "import.meta.env.SSR": "false",
    },
  },
  html: {
    template: "./index.html",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
