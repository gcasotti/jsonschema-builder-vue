# JSON Schema Builder (Vue)

[![image](screenshot.png)](https://gcasotti.github.io/jsonschema-builder-vue)

A modern, Vue 3 + PrimeVue visual JSON Schema editor for creating and manipulating JSON Schema definitions with an intuitive interface.

> **Note**: This project is a fork of [jsonjoy-builder](https://github.com/lovasoa/jsonjoy-builder) by [Ophir LOJKINE](https://ophir.dev), rewritten from React to Vue 3 + PrimeVue.

**Live Demo**: https://gcasotti.github.io/jsonschema-builder-vue

**Repository**: https://github.com/gcasotti/jsonschema-builder-vue

[![NPM Version](https://img.shields.io/npm/v/jsonschema-builder-vue)](https://www.npmjs.com/package/jsonschema-builder-vue)
[![NPM License](https://img.shields.io/npm/l/jsonschema-builder-vue)](https://www.npmjs.com/package/jsonschema-builder-vue)

## Features

- **Visual Schema Editor**: Design your JSON Schema through an intuitive interface without writing raw JSON
- **Real-time JSON Preview**: See your schema in JSON format as you build it visually
- **Schema Inference**: Generate schemas automatically from existing JSON data
- **JSON Validation**: Test JSON data against your schema with detailed validation feedback
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Getting Started

### Installing

```bash
npm install jsonschema-builder-vue
```

Also install vue if you haven't done so yet.

Then use like this:

```vue
<script setup lang="ts">
import "jsonschema-builder-vue/styles.css";
import { type JSONSchema, SchemaVisualEditor } from "jsonschema-builder-vue";
import { ref } from "vue";

const schema = ref<JSONSchema>({});
</script>

<template>
  <div>
    <SchemaVisualEditor :schema="schema" @change="schema = $event" />
  </div>
</template>
```

### Styling

To style the component, add custom CSS. For basic styling, there are some CSS custom properties ("variables")
you can set:

```css
.jsonjoy {
  --jsonjoy-background: #f8fafc;
  --jsonjoy-foreground: #020817;
  --jsonjoy-card: #fff;
  --jsonjoy-card-foreground: #020817;
  --jsonjoy-popover: #fff;
  --jsonjoy-popover-foreground: #020817;
  --jsonjoy-primary: #0080ff;
  --jsonjoy-primary-foreground: #f8fafc;
  --jsonjoy-secondary: #f1f5f9;
  --jsonjoy-secondary-foreground: #0f172a;
  --jsonjoy-muted: #f1f5f9;
  --jsonjoy-muted-foreground: #64748b;
  --jsonjoy-accent: #f1f5f9;
  --jsonjoy-accent-foreground: #0f172a;
  --jsonjoy-destructive: #ef4444;
  --jsonjoy-destructive-foreground: #f8fafc;
  --jsonjoy-border: #e2e8f0;
  --jsonjoy-input: #e2e8f0;
  --jsonjoy-ring: #020817;
  --jsonjoy-radius: .8rem;
  --jsonjoy-font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.jsonjoy.dark {
  /** same, but for dark mode */
}
```

### Localization

By default, the editor uses English. To localize, use `provideTranslation` in a parent component:

```vue
<script setup lang="ts">
import "jsonschema-builder-vue/styles.css";
import { type JSONSchema, SchemaVisualEditor, provideTranslation } from "jsonschema-builder-vue";
import { de } from "jsonschema-builder-vue/i18n/locales/de";
import { ref } from "vue";

const lang = ref(de);
provideTranslation(lang);
const schema = ref<JSONSchema>({});
</script>

<template>
  <SchemaVisualEditor :schema="schema" @change="schema = $event" />
</template>
```

Currently we have localizations for English, German, French, Italian, Polish, Russian, Ukrainian, Spanish and Chinese. You can define your own translation like this.
If you do, consider opening a PR with the translations!

```ts
import { type Translation } from "jsonschema-builder-vue";

const es: Translation = {
	// add translations here (see type Translation for the available keys and default values)
};
```

See also the [English localizations file](https://github.com/gcasotti/jsonschema-builder-vue/blob/main/src/i18n/locales/en.ts) for the default localizations.

### Development

```bash
git clone https://github.com/gcasotti/jsonschema-builder-vue.git
cd jsonschema-builder-vue
npm install
```

Start the development server:

```bash
npm run dev
```

The demo application will be available at http://localhost:8080

### Building for Production

Build this library for production:

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Project Architecture

### Core Components

- **JsonSchemaEditor**: The main component that provides tabs for switching between visual and JSON views
- **SchemaVisualEditor**: Handles the visual representation and editing of schemas
- **JsonSchemaVisualizer**: Provides JSON view with Monaco editor for direct schema editing
- **SchemaInferencer**: Dialog component for generating schemas from JSON data
- **JsonValidator**: Dialog component for validating JSON against the current schema

### Key Features

#### Schema Inference

The `SchemaInferencer` component can automatically generate JSON Schema definitions from existing JSON data. This feature uses a recursion-based inference system to detect:

- Object structures and properties
- Array types and their item schemas
- String formats (dates, emails, URIs)
- Numeric types (integers vs. floats)
- Required fields

#### JSON Validation

Validate any JSON document against your schema with:
- Real-time feedback
- Detailed error reporting
- Format validation for emails, dates, and other special formats

## Technology Stack

- **Vue 3**: UI framework (Composition API, `<script setup>`)
- **PrimeVue**: Component library (Aura theme)
- **TypeScript**: Type-safe development
- **Rsbuild** / **Rslib**: Build tool and development server
- **Monaco Editor**: Code editor for JSON viewing/editing
- **Ajv**: JSON Schema validation
- **Zod**: Type-safe json parsing in ts
- **Lucide Vue Next**: Icon library
- **Vitest**: Unit and component testing

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build library for production |
| `npm run build:demo` | Build demo page |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |
| `npm run check` | Run Biome lint + format checks |
| `npm run fix` | Auto-fix lint issues |
| `npm run typecheck` | Type check with vue-tsc |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests |
| `npm run test:ui` | Run component tests (Vitest) |
| `npm run test:all` | Run all tests |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

[@gcasotti](https://github.com/gcasotti)

## Acknowledgements

This project is a Vue 3 port of [jsonjoy-builder](https://github.com/lovasoa/jsonjoy-builder), originally created by [Ophir LOJKINE (@lovasoa)](https://ophir.dev). Thanks for the excellent work on the original project!
