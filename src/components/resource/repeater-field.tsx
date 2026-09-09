import { useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FieldMeta } from "@/lib/blocks/schema-meta";
import { COMPLEX_TYPES } from "@/lib/blocks/schema-meta";
import { Button } from "@/components/ui/button";
import { fieldLabel } from "@/lib/format";
import { SubFieldInput } from "./sub-field-input";

function safeParseArray(json: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function singularize(name: string): string {
  return name.endsWith("ies") ? `${name.slice(0, -3)}y` : name.endsWith("s") ? name.slice(0, -1) : name;
}

/**
 * Structured editor for an array-of-complex-type field (Media, Attributes,
 * VariantOptions, PurchaseOrder.Items, StockTransfer.Items, …) — replaces a raw JSON
 * textarea with add/remove rows, one input per sub-field. Still writes back the same
 * JSON string `form-values.ts` expects (`toPayload` JSON.parses it unchanged), so line
 * items stay easy to add/edit/remove without touching the submission payload shape.
 */
export function RepeaterField({ field, value, onChange }: { field: FieldMeta; value: string; onChange: (value: string) => void }) {
  const shape = COMPLEX_TYPES[field.type] ?? [];
  const items = useMemo(() => safeParseArray(value), [value]);

  function commit(next: Record<string, unknown>[]) {
    onChange(JSON.stringify(next));
  }

  function addRow() {
    commit([...items, {}]);
  }

  function removeRow(index: number) {
    commit(items.filter((_, i) => i !== index));
  }

  function setCell(index: number, name: string, v: unknown) {
    commit(items.map((row, i) => (i === index ? { ...row, [name]: v } : row)));
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs text-muted">No {fieldLabel(field.name).toLowerCase()} yet.</p>}
      {items.map((row, index) => (
        <div key={index} className="rounded-md border border-hairline bg-surface-soft p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {shape.map((sub) => (
              <div key={sub.name} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-steel">{fieldLabel(sub.name)}</label>
                <SubFieldInput field={sub} value={row[sub.name]} onChange={(v) => setCell(index, sub.name, v)} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(index)}>
              <Trash2 size={14} className="text-brand-error" /> Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        <Plus size={14} /> Add {singularize(fieldLabel(field.name))}
      </Button>
    </div>
  );
}
