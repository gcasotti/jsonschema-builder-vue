import { describe, expect, it } from "vitest";
import { formatTranslation } from "../src/hooks/use-translation.ts";
import { de } from "../src/i18n/locales/de.ts";
import { en } from "../src/i18n/locales/en.ts";
import { fr } from "../src/i18n/locales/fr.ts";
import type { Translation } from "../src/i18n/translation-keys.ts";

describe("i18n Translations", () => {
  it("en locale has all required keys", () => {
    const requiredKeys: (keyof Translation)[] = [
      "fieldAddNewButton",
      "fieldAddNewLabel",
      "fieldNameLabel",
      "fieldType",
      "propertyRequired",
      "propertyOptional",
      "propertyDelete",
      "schemaEditorTitle",
      "schemaTypeString",
      "schemaTypeNumber",
      "schemaTypeBoolean",
      "schemaTypeObject",
      "schemaTypeArray",
      "schemaTypeNull",
    ];

    for (const key of requiredKeys) {
      expect(en[key], `Missing key: ${key}`).toBeDefined();
      expect(en[key], `Empty key: ${key}`).not.toBe("");
    }
  });

  it("de locale has the same keys as en", () => {
    const enKeys = Object.keys(en);
    const deKeys = Object.keys(de);
    for (const key of enKeys) {
      expect(deKeys, `Missing key in de: ${key}`).toContain(key);
    }
  });

  it("fr locale has the same keys as en", () => {
    const enKeys = Object.keys(en);
    const frKeys = Object.keys(fr);
    for (const key of enKeys) {
      expect(frKeys, `Missing key in fr: ${key}`).toContain(key);
    }
  });

  it("formatTranslation replaces placeholders", () => {
    const result = formatTranslation("Hello {name}, you are {age} years old", {
      name: "John",
      age: 30,
    });
    expect(result).toBe("Hello John, you are 30 years old");
  });

  it("formatTranslation keeps unknown placeholders", () => {
    const result = formatTranslation("Hello {name}, {unknown} value", {
      name: "Jane",
    });
    expect(result).toBe("Hello Jane, {unknown} value");
  });

  it("formatTranslation handles empty values", () => {
    const result = formatTranslation("No {replacements} here", {});
    expect(result).toBe("No {replacements} here");
  });
});
