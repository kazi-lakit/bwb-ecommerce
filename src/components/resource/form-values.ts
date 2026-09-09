import type { EntityRecord } from "@/lib/blocks/collections";
import type { EntityMeta, FieldMeta } from "@/lib/blocks/schema-meta";
import { isComplexField } from "./field-input";

export type FormValues = Record<string, string | boolean>;

/** Builds the initial (string-serialized) form state for an entity's editable fields. */
export function toFormValues(meta: EntityMeta, record: EntityRecord | null | undefined): FormValues {
  const values: FormValues = {};
  for (const field of meta.fields) {
    const raw = record?.[field.name];
    values[field.name] = fieldToFormValue(field, raw);
  }
  return values;
}

function fieldToFormValue(field: FieldMeta, raw: unknown): string | boolean {
  if (raw == null) return field.type === "Boolean" ? false : "";
  if (field.type === "Boolean") return Boolean(raw);
  if (isComplexField(field)) return JSON.stringify(raw, null, 2);
  if (field.isArray) return Array.isArray(raw) ? raw.join(", ") : String(raw);
  if (field.type === "DateTime") return typeof raw === "string" ? raw.slice(0, 16) : "";
  return String(raw);
}

export interface FieldErrors {
  [fieldName: string]: string;
}

/** Validates form state against each field's ValidationRules-derived metadata. */
export function validateFormValues(meta: EntityMeta, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of meta.fields) {
    const value = values[field.name];
    const isEmpty = field.type === "Boolean" ? false : !value || (typeof value === "string" && value.trim() === "");

    if (field.required && isEmpty) {
      errors[field.name] = field.errorMessages?.required || `${field.name} is required.`;
      continue;
    }
    if (isEmpty) continue;

    if (field.pattern && !field.isArray && typeof value === "string" && !isComplexField(field)) {
      try {
        if (!new RegExp(field.pattern).test(value)) {
          errors[field.name] = field.errorMessages?.pattern || `${field.name} is invalid.`;
          continue;
        }
      } catch {
        // Malformed pattern from the schema export — skip rather than block the user.
      }
    }

    if (typeof field.min === "number" && (field.type === "Int" || field.type === "Float") && typeof value === "string") {
      const num = Number(value);
      if (!Number.isNaN(num) && num < field.min) {
        errors[field.name] = field.errorMessages?.min || `${field.name} must be at least ${field.min}.`;
        continue;
      }
    }

    if (isComplexField(field) && typeof value === "string") {
      try {
        JSON.parse(value);
      } catch {
        errors[field.name] = "Must be valid JSON.";
      }
    }
  }
  return errors;
}

/** Converts string-serialized form state back into the typed payload the Data Gateway expects. */
export function toPayload(meta: EntityMeta, values: FormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of meta.fields) {
    const value = values[field.name];
    const isEmpty = field.type === "Boolean" ? false : !value || (typeof value === "string" && value.trim() === "");
    if (isEmpty && !field.required) continue;

    if (field.type === "Boolean") {
      payload[field.name] = Boolean(value);
    } else if (isComplexField(field)) {
      payload[field.name] = JSON.parse(value as string);
    } else if (field.isArray) {
      payload[field.name] = String(value)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (field.type === "Int") {
      payload[field.name] = parseInt(value as string, 10);
    } else if (field.type === "Float") {
      payload[field.name] = parseFloat(value as string);
    } else if (field.type === "DateTime") {
      payload[field.name] = new Date(value as string).toISOString();
    } else {
      payload[field.name] = value;
    }
  }
  return payload;
}
