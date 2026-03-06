import {
  type InjectionKey,
  inject,
  provide,
  type ShallowRef,
  shallowRef,
} from "vue";
import type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
} from "../types/jsonSchema.ts";
import { isObjectSchema } from "../types/jsonSchema.ts";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SchemaStore {
  /** The current schema (read-only shallow ref). */
  schema: ShallowRef<JSONSchema>;

  /** Get a nested sub-schema at the given property path. */
  getAtPath(path: string[]): JSONSchema | undefined;

  /** Replace the property schema at `path > propertyName` with a new value. */
  updateProperty(
    path: string[],
    propertyName: string,
    propertySchema: JSONSchema,
  ): void;

  /** Delete a property at `path > propertyName`. */
  deleteProperty(path: string[], propertyName: string): void;

  /** Rename a property at `path` while preserving order. */
  renameProperty(path: string[], oldName: string, newName: string): void;

  /** Set the required status of a property at `path > propertyName`. */
  setPropertyRequired(
    path: string[],
    propertyName: string,
    required: boolean,
  ): void;

  /** Add a new field at `path`. */
  addProperty(path: string[], field: NewField): void;

  /** Replace the entire schema (for "Reset", "Infer from JSON", Monaco edits). */
  replaceSchema(newSchema: JSONSchema): void;
}

export const SchemaStoreKey: InjectionKey<SchemaStore> = Symbol("SchemaStore");

// ─── Pure helpers (no Vue dependency) ────────────────────────────────────────

/** Deep-clone a schema. Always produces a plain JS object. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Navigate to the object schema at the given property path.
 * Returns `undefined` if the path is invalid.
 */
function navigateToPath(
  root: JSONSchema,
  path: string[],
): ObjectJSONSchema | undefined {
  let current: JSONSchema = root;
  for (const segment of path) {
    if (!isObjectSchema(current) || !current.properties) return undefined;
    const next = current.properties[segment];
    if (next === undefined) return undefined;
    // If the property is an array with items, follow .items
    if (
      isObjectSchema(next) &&
      next.type === "array" &&
      next.items &&
      isObjectSchema(next.items)
    ) {
      current = next.items;
    } else {
      current = next;
    }
  }
  return isObjectSchema(current) ? current : undefined;
}

/**
 * Get the sub-schema at a given property path (not necessarily an object schema).
 */
function getSubSchema(
  root: JSONSchema,
  path: string[],
): JSONSchema | undefined {
  if (path.length === 0) return root;
  let current: JSONSchema = root;
  for (const segment of path) {
    if (!isObjectSchema(current) || !current.properties) return undefined;
    const next = current.properties[segment];
    if (next === undefined) return undefined;
    current = next;
  }
  return current;
}

/**
 * Immutably set a property schema deep in the tree.
 * Returns a new root schema.
 */
function setDeep(
  root: JSONSchema,
  path: string[],
  propertyName: string,
  propertySchema: JSONSchema,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent)) return newRoot;
  if (!parent.properties) parent.properties = {};
  parent.properties[propertyName] = propertySchema;
  return newRoot;
}

/**
 * Immutably delete a property deep in the tree.
 */
function deleteDeep(
  root: JSONSchema,
  path: string[],
  propertyName: string,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent) || !parent.properties) return newRoot;

  const { [propertyName]: _, ...rest } = parent.properties;
  parent.properties = rest;

  if (parent.required) {
    parent.required = parent.required.filter((n) => n !== propertyName);
  }
  return newRoot;
}

/**
 * Immutably rename a property deep in the tree, preserving key order.
 */
function renameDeep(
  root: JSONSchema,
  path: string[],
  oldName: string,
  newName: string,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent) || !parent.properties) return newRoot;

  const newProps: Record<string, JSONSchema> = {};
  for (const [key, value] of Object.entries(parent.properties)) {
    newProps[key === oldName ? newName : key] = value;
  }
  parent.properties = newProps;

  if (parent.required) {
    parent.required = parent.required.map((n) => (n === oldName ? newName : n));
  }
  return newRoot;
}

/**
 * Immutably set the required status of a property.
 */
function setRequiredDeep(
  root: JSONSchema,
  path: string[],
  propertyName: string,
  required: boolean,
): JSONSchema {
  const newRoot = clone(root);
  const parent = path.length === 0 ? newRoot : navigateToPath(newRoot, path);

  if (!parent || !isObjectSchema(parent)) return newRoot;
  if (!parent.required) parent.required = [];

  if (required) {
    if (!parent.required.includes(propertyName)) {
      parent.required.push(propertyName);
    }
  } else {
    parent.required = parent.required.filter((n) => n !== propertyName);
  }
  return newRoot;
}

// ─── Store factory ───────────────────────────────────────────────────────────

/**
 * Create a schema store. Call this in the root component (JsonSchemaEditor)
 * and `provide` it for all descendants.
 *
 * @param initialSchema - The initial schema value (will be deep-cloned).
 * @param onChange - Callback fired whenever the schema changes (for v-model / emit).
 */
export function createSchemaStore(
  initialSchema: JSONSchema,
  onChange?: (schema: JSONSchema) => void,
): SchemaStore {
  const schema = shallowRef<JSONSchema>(clone(initialSchema));

  // ── Loop safety net ──────────────────────────────────────────────────────
  // Hard limit: if more than MAX_COMMITS happen in a single synchronous
  // execution batch, subsequent commits are silently dropped. This prevents
  // the browser from freezing even if a reactive loop survives all other guards.
  const MAX_COMMITS_PER_BATCH = 10;
  let commitCount = 0;
  let batchScheduled = false;

  function resetCommitCount(): void {
    commitCount = 0;
    batchScheduled = false;
  }

  // Reentrance guard: prevent any mutation while another is still being processed.
  let isUpdating = false;

  function commit(newSchema: JSONSchema): void {
    if (isUpdating) return;

    // Per-batch rate limit — resets on the next macrotask (AFTER all microtask watchers)
    if (!batchScheduled) {
      batchScheduled = true;
      setTimeout(resetCommitCount, 0);
    }
    commitCount++;
    if (commitCount > MAX_COMMITS_PER_BATCH) {
      if (typeof console !== "undefined") {
        console.warn(
          "[SchemaStore] commit rate limit reached — dropping update to prevent loop",
        );
      }
      return;
    }

    isUpdating = true;
    try {
      schema.value = newSchema;
      onChange?.(newSchema);
    } finally {
      isUpdating = false;
    }
  }

  const store: SchemaStore = {
    schema,

    getAtPath(path: string[]): JSONSchema | undefined {
      return getSubSchema(schema.value, path);
    },

    updateProperty(
      path: string[],
      propertyName: string,
      propertySchema: JSONSchema,
    ): void {
      commit(setDeep(schema.value, path, propertyName, clone(propertySchema)));
    },

    deleteProperty(path: string[], propertyName: string): void {
      commit(deleteDeep(schema.value, path, propertyName));
    },

    renameProperty(path: string[], oldName: string, newName: string): void {
      commit(renameDeep(schema.value, path, oldName, newName));
    },

    setPropertyRequired(
      path: string[],
      propertyName: string,
      required: boolean,
    ): void {
      commit(setRequiredDeep(schema.value, path, propertyName, required));
    },

    addProperty(path: string[], field: NewField): void {
      const { type, description, additionalProperties } = field;
      const fieldSchema: ObjectJSONSchema = {
        type,
        ...(description ? { description } : {}),
        ...(additionalProperties === false ? { additionalProperties } : {}),
      };

      let newSchema = setDeep(schema.value, path, field.name, fieldSchema);
      if (field.required) {
        newSchema = setRequiredDeep(newSchema, path, field.name, true);
      }
      commit(newSchema);
    },

    replaceSchema(newSchema: JSONSchema): void {
      commit(clone(newSchema));
    },
  };

  return store;
}

// ─── Provide / Inject helpers ────────────────────────────────────────────────

export function provideSchemaStore(store: SchemaStore): void {
  provide(SchemaStoreKey, store);
}

export function useSchemaStore(): SchemaStore {
  const store = inject(SchemaStoreKey);
  if (!store) {
    throw new Error(
      "useSchemaStore() was called without a parent providing SchemaStore. " +
        "Wrap your component tree with JsonSchemaEditor or call provideSchemaStore().",
    );
  }
  return store;
}

// Export pure helpers for testing
export const _testing = {
  clone,
  navigateToPath,
  getSubSchema,
  setDeep,
  deleteDeep,
  renameDeep,
  setRequiredDeep,
};
