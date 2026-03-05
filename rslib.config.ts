import { pluginVue } from "@rsbuild/plugin-vue";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  plugins: [pluginVue()],
  source: {
    entry: {
      index: ["./src/**"],
    },
    tsconfigPath: "./src/tsconfig.json",
  },
  server: {
    publicDir: false,
  },
  lib: [
    {
      bundle: false,
      dts: {
        build: false,
        bundle: {
          bundledPackages: [],
        },
      },
      format: "esm",
    },
  ],
  output: {
    target: "web",
  },
});
