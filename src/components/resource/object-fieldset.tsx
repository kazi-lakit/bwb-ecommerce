import { useMemo } from "react";
import type { FieldMeta } from "@/lib/blocks/schema-meta";
import { COMPLEX_TYPES } from "@/lib/blocks/schema-meta";
import { SubFieldInput } from "./sub-field-input";

function safeParseObject(json: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(json || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Structured editor for a single complex-type field (Address, Contact, Pricing,
 * Dimensions, …) — replaces a raw JSON textarea with one input per sub-field, still
 * writing back the same JSON string `form-values.ts` expects (`toPayload` JSON.parses
 * it unchanged).
 */
export function ObjectFieldset({ field, value, onChange }: { field: FieldMeta; value: string; onChange: (value: string) => void }) {
  const shape = COMPLEX_TYPES[field.type] ?? [];
  const obj = useMemo(() => safeParseObject(value), [value]);

  function setSub(name: string, v: unknown) {
    const next = { ...obj };
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) delete next[name];
    else next[name] = v;
    onChange(JSON.stringify(next));
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border border-hairline bg-surface-soft p-3 sm:grid-cols-2">
      {shape.map((sub) => (
        <div key={sub.name} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-steel">{sub.name}</label>
          <SubFieldInput field={sub} value={obj[sub.name]} onChange={(v) => setSub(sub.name, v)} />
        </div>
      ))}
    </div>
  );
}
