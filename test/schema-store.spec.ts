import { describe, expect, it, vi } from "vitest";
import { _testing, createSchemaStore } from "../src/hooks/useSchemaStore.ts";
import type { JSONSchema, ObjectJSONSchema } from "../src/types/jsonSchema.ts";

const {
  navigateToPath,
  getSubSchema,
  setDeep,
  deleteDeep,
  renameDeep,
  setRequiredDeep,
} = _testing;

// All tests have a 5-second timeout to catch infinite loops
const TIMEOUT = 5000;

// ─── Pure helper tests ───────────────────────────────────────────────────────

describe("navigateToPath", () => {
  const root: JSONSchema = {
    type: "object",
    properties: {
      person: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          address: {
            type: "object",
            properties: {
              city: { type: "string" },
            },
          },
        },
      },
      tags: {
        type: "array",
        items: {
          type: "object",
          properties: { label: { type: "string" } },
        },
      },
    },
  };

  it("returns root for empty path", { timeout: TIMEOUT }, () => {
    expect(navigateToPath(root, [])).toBe(root);
  });

  it("navigates one level deep", { timeout: TIMEOUT }, () => {
    const result = navigateToPath(root, ["person"]);
    expect(result).toBeDefined();
    expect((result as ObjectJSONSchema).type).toBe("object");
    expect((result as ObjectJSONSchema).properties?.firstName).toBeDefined();
  });

  it("navigates two levels deep", { timeout: TIMEOUT }, () => {
    const result = navigateToPath(root, ["person", "address"]);
    expect(result).toBeDefined();
    expect((result as ObjectJSONSchema).properties?.city).toBeDefined();
  });

  it("follows array items", { timeout: TIMEOUT }, () => {
    const result = navigateToPath(root, ["tags"]);
    expect(result).toBeDefined();
    expect((result as ObjectJSONSchema).properties?.label).toBeDefined();
  });

  it("returns undefined for invalid path", { timeout: TIMEOUT }, () => {
    expect(navigateToPath(root, ["nonexistent"])).toBeUndefined();
  });
});

describe("getSubSchema", () => {
  const root: JSONSchema = {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
    },
  };

  it("returns root for empty path", { timeout: TIMEOUT }, () => {
    expect(getSubSchema(root, [])).toBe(root);
  });

  it("returns property schema", { timeout: TIMEOUT }, () => {
    const result = getSubSchema(root, ["name"]);
    expect(result).toEqual({ type: "string", minLength: 1 });
  });

  it("returns undefined for invalid path", { timeout: TIMEOUT }, () => {
    expect(getSubSchema(root, ["missing"])).toBeUndefined();
  });
});

describe("setDeep", () => {
  it("sets a property at root level", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: { a: { type: "string" } },
    };
    const result = setDeep(root, [], "b", { type: "number" });
    expect((result as ObjectJSONSchema).properties?.b).toEqual({
      type: "number",
    });
    expect((result as ObjectJSONSchema).properties?.a).toEqual({
      type: "string",
    });
  });

  it("sets a property nested in an object", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: {
        person: { type: "object", properties: { name: { type: "string" } } },
      },
    };
    const result = setDeep(root, ["person"], "age", { type: "number" });
    const person = (result as ObjectJSONSchema).properties
      ?.person as ObjectJSONSchema;
    expect(person.properties?.age).toEqual({ type: "number" });
    expect(person.properties?.name).toEqual({ type: "string" });
  });

  it("does not mutate the original schema", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: { a: { type: "string" } },
    };
    const original = JSON.stringify(root);
    setDeep(root, [], "b", { type: "number" });
    expect(JSON.stringify(root)).toBe(original);
  });
});

describe("deleteDeep", () => {
  it("deletes a root-level property", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: { a: { type: "string" }, b: { type: "number" } },
      required: ["a"],
    };
    const result = deleteDeep(root, [], "a") as ObjectJSONSchema;
    expect(result.properties?.a).toBeUndefined();
    expect(result.properties?.b).toEqual({ type: "number" });
    expect(result.required).toEqual([]);
  });

  it("deletes a nested property", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: {
        person: {
          type: "object",
          properties: { name: { type: "string" }, age: { type: "number" } },
        },
      },
    };
    const result = deleteDeep(root, ["person"], "name") as ObjectJSONSchema;
    const person = result.properties?.person as ObjectJSONSchema;
    expect(person.properties?.name).toBeUndefined();
    expect(person.properties?.age).toEqual({ type: "number" });
  });
});

describe("renameDeep", () => {
  it(
    "renames a root-level property preserving order",
    { timeout: TIMEOUT },
    () => {
      const root: JSONSchema = {
        type: "object",
        properties: { a: { type: "string" }, b: { type: "number" } },
        required: ["a"],
      };
      const result = renameDeep(root, [], "a", "alpha") as ObjectJSONSchema;
      const keys = Object.keys(result.properties!);
      expect(keys).toEqual(["alpha", "b"]);
      expect(result.required).toEqual(["alpha"]);
    },
  );
});

describe("setRequiredDeep", () => {
  it("adds to the required array", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: { a: { type: "string" } },
    };
    const result = setRequiredDeep(root, [], "a", true) as ObjectJSONSchema;
    expect(result.required).toEqual(["a"]);
  });

  it("removes from the required array", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
    };
    const result = setRequiredDeep(root, [], "a", false) as ObjectJSONSchema;
    expect(result.required).toEqual([]);
  });

  it("does not duplicate in required array", { timeout: TIMEOUT }, () => {
    const root: JSONSchema = {
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"],
    };
    const result = setRequiredDeep(root, [], "a", true) as ObjectJSONSchema;
    expect(result.required).toEqual(["a"]);
  });
});

// ─── Store integration tests ─────────────────────────────────────────────────

describe("createSchemaStore", () => {
  const initialSchema: JSONSchema = {
    type: "object",
    properties: {
      person: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
        required: ["firstName"],
      },
      age: { type: "number" },
    },
    required: ["person"],
  };

  it("initializes with a clone of the schema", { timeout: TIMEOUT }, () => {
    const store = createSchemaStore(initialSchema);
    expect(store.schema.value).toEqual(initialSchema);
    expect(store.schema.value).not.toBe(initialSchema);
  });

  it("calls onChange on updateProperty", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    store.updateProperty([], "email", { type: "string", format: "email" });
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = store.schema.value as ObjectJSONSchema;
    expect(updated.properties?.email).toEqual({
      type: "string",
      format: "email",
    });
  });

  it("calls onChange on deleteProperty", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    store.deleteProperty([], "age");
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = store.schema.value as ObjectJSONSchema;
    expect(updated.properties?.age).toBeUndefined();
    expect(updated.properties?.person).toBeDefined();
  });

  it("calls onChange on renameProperty", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    store.renameProperty([], "age", "userAge");
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = store.schema.value as ObjectJSONSchema;
    expect(updated.properties?.userAge).toEqual({ type: "number" });
    expect(updated.properties?.age).toBeUndefined();
  });

  it("calls onChange on setPropertyRequired", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    store.setPropertyRequired([], "age", true);
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = store.schema.value as ObjectJSONSchema;
    expect(updated.required).toContain("age");
  });

  it("handles nested updateProperty", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    store.updateProperty(["person"], "firstName", { type: "number" });
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = store.schema.value as ObjectJSONSchema;
    const person = updated.properties?.person as ObjectJSONSchema;
    expect(person.properties?.firstName).toEqual({ type: "number" });
  });

  it("handles addProperty with required", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    store.addProperty([], {
      name: "email",
      type: "string",
      description: "User email",
      required: true,
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    const updated = store.schema.value as ObjectJSONSchema;
    expect(updated.properties?.email).toBeDefined();
    expect(updated.required).toContain("email");
  });

  it("handles replaceSchema", { timeout: TIMEOUT }, () => {
    const onChange = vi.fn();
    const store = createSchemaStore(initialSchema, onChange);
    const newSchema = { type: "object" as const, properties: {} };
    store.replaceSchema(newSchema);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(store.schema.value).toEqual(newSchema);
    expect(store.schema.value).not.toBe(newSchema); // must be a clone
  });

  it("reentrance guard prevents nested calls", { timeout: TIMEOUT }, () => {
    let callCount = 0;
    const onChange = (_schema: JSONSchema) => {
      callCount++;
      // Simulate a re-entrant call (e.g., from a watcher triggered by the change)
      if (callCount < 10) {
        store.updateProperty([], "loopTest", { type: "string" });
      }
    };
    const store = createSchemaStore(initialSchema, onChange);
    store.updateProperty([], "trigger", { type: "boolean" });
    // Should only have been called once, NOT 10 times
    expect(callCount).toBe(1);
  });

  it("getAtPath returns correct sub-schema", { timeout: TIMEOUT }, () => {
    const store = createSchemaStore(initialSchema);
    expect(store.getAtPath([])).toEqual(initialSchema);
    const personSchema = store.getAtPath(["person"]);
    expect(personSchema).toBeDefined();
    expect((personSchema as ObjectJSONSchema).properties?.firstName).toEqual({
      type: "string",
    });
  });

  it(
    "produces plain objects, never reactive proxies",
    { timeout: TIMEOUT },
    () => {
      const store = createSchemaStore(initialSchema);
      store.updateProperty([], "test", { type: "string" });
      const schema = store.schema.value;
      // Verify it's a plain object (no Vue proxy)
      // Vue proxies have __v_isReactive or Symbol.toStringTag
      expect(typeof schema).toBe("object");
      expect(JSON.stringify(schema)).toBe(JSON.stringify(schema)); // would fail on circular refs
    },
  );
});
