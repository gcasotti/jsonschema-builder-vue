# v0.5.0

## Breaking Changes

- **Build system migrated from rslib/rspack to Vite** — the library output is now standard ES module JavaScript, compatible with Vite, Webpack 5, Rollup, esbuild, and any modern bundler.
- **CSS export path changed** — `import "jsonschema-builder-vue/styles.css"` now resolves to `dist/index.css` (previously `dist/index.css` via a different build pipeline).
- **`monaco-editor` is now an optional peer dependency** — consumers who use `JsonSchemaEditor`, `JsonSchemaVisualizer`, `JsonValidator`, or `SchemaInferencer` must install `monaco-editor` separately. Consumers using only `SchemaVisualEditor` do not need it.
- **Type declarations** are now a single rolled-up `dist/index.d.ts` (previously `dist/jsonschema-builder-vue.d.ts`).

## New Features

- **All locales exported from barrel** — `de`, `en`, `es`, `fr`, `it`, `pl`, `ru`, `uk`, `zh` can now be imported directly: `import { it, fr } from "jsonschema-builder-vue"`. No more sub-path locale imports needed.
- **Monaco lazy loading / tree-shaking** — all `monaco-editor` imports are now dynamic (`import("monaco-editor")`). Consumers who only use the visual editor (`SchemaVisualEditor`) will never load Monaco, regardless of bundler.

## Infrastructure

- Build tool: `vite build` (library mode) with `vite-plugin-dts` for type generation.
- Demo/playground: `BUILD_MODE=demo vite` (dev) / `BUILD_MODE=demo vite build` (production).
- Removed dependencies: `@rsbuild/core`, `@rsbuild/plugin-vue`, `@rslib/core`, `rspack-vue-loader`, `@microsoft/api-extractor`.
- Added dependencies: `vite`, `vite-plugin-dts`.
- GitHub Actions release workflow updated to use `npm run build:demo` instead of `npx rsbuild build`.

## Build Output

| File | Size | Gzipped |
|------|------|---------|
| `dist/index.js` | ~797 KB | ~167 KB |
| `dist/index.css` | ~65 KB | ~11 KB |
| `dist/index.d.ts` | rolled-up types | — |
