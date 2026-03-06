# v0.4.1

Package renamed to `jsonschema-builder-vue`.

## New Features

- **Reactive i18n system** — `provideTranslation()` now accepts a `Ref<Translation>` for instant language switching at runtime. All components update automatically, no page reload needed.
- **Italian locale** — new `it` locale alongside the existing `en`, `de`, `fr`, `es`, `ru`, `uk`, `zh`, `pl`.
- **`JsonSchemaEditor` new props:**
  - `showJsonEditor` — hide the Monaco JSON panel for a visual-only experience.
  - `showFullscreen` — hide the fullscreen toggle for embedded layouts.
  - `readOnly` — display a schema without allowing edits.
- **`SchemaInferencer` inline mode** — omit `:visible` to render inline instead of as a dialog. Fully decoupled from `JsonSchemaEditor`.
- **`JsonValidator` inline mode** — same pattern: omit `:visible` for inline rendering.
- **Standalone utility functions** — `createSchemaFromJson()` and `validateJson()` usable without Vue.

## Bug Fixes

- Fixed infinite reactive loop caused by tight coupling between Monaco editor and visual editor.
- Fixed translation keys mismatch in inferencer and validator button labels.
- Fixed UI wobble/glitch when loading or expanding nested properties (removed entrance animations on structural elements).

## Documentation

- Interactive demo page redesigned as a component documentation guide with props/events tables, live examples, and copyable code snippets.

## Infrastructure

- CI/CD workflow for automated npm publish (OIDC) + GitHub Release + GitHub Pages demo deployment on tag push.
