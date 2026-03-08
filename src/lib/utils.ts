import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Translation } from "../i18n/translation-keys.ts";
import type { SchemaType } from "../types/jsonSchema.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper functions for backward compatibility
export const getTypeColor = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "text-blue-500 bg-blue-500/10";
    case "number":
    case "integer":
      return "text-purple-500 bg-purple-500/10";
    case "boolean":
      return "text-green-500 bg-green-500/10";
    case "object":
      return "text-orange-500 bg-orange-500/10";
    case "array":
      return "text-pink-500 bg-pink-500/10";
    case "null":
      return "text-gray-500 bg-gray-500/10";
  }
};

// Get type display label
export const getTypeLabel = (t: Translation, type: SchemaType): string => {
  switch (type) {
    case "string":
      return t.schemaTypeString;
    case "number":
    case "integer":
      return t.schemaTypeNumber;
    case "boolean":
      return t.schemaTypeBoolean;
    case "object":
      return t.schemaTypeObject;
    case "array":
      return t.schemaTypeArray;
    case "null":
      return t.schemaTypeNull;
  }
};
