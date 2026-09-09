import { useMemo } from "react";
import clsx from "clsx";
import { useEntityList } from "@/lib/blocks/hooks";
import type { EntityRecord } from "@/lib/blocks/collections";
import { Select } from "@/components/ui/select";

function labelFor(item: EntityRecord): string {
  return (item.Name as string) || (item.Sku as string) || (item.Code as string) || ((item.ItemId ?? item.itemId) as string);
}

export interface ReferenceSelectProps {
  /** The schema this field's value(s) point at — see reference-fields.ts. */
  targetSchema: string;
  isArray: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  id?: string;
}

/**
 * A searchable (native `<select>`s support type-ahead) picker for an ItemId reference
 * field, listing the target entity's real names instead of asking for a raw GUID.
 * Still emits/consumes the exact same value shape `form-values.ts` already expects —
 * a plain id string, or a comma-joined string for an array field — so the submitted
 * payload is unchanged.
 */
export function ReferenceSelect({ targetSchema, isArray, value, onChange, error, id }: ReferenceSelectProps) {
  const list = useEntityList(targetSchema, { pageSize: 200 });
  const options = useMemo(
    () => [...(list.data?.items ?? [])].sort((a, b) => labelFor(a).localeCompare(labelFor(b))),
    [list.data]
  );

  if (isArray) {
    const selected = typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];
    return (
      <select
        id={id}
        multiple
        value={selected}
        onChange={(e) => onChange(Array.from(e.target.selectedOptions, (o) => o.value).join(", "))}
        className={clsx(
          "min-h-24 w-full rounded-md border bg-canvas p-2 text-sm text-ink outline-none focus:border-2 focus:border-brand-accent",
          error ? "border-brand-error" : "border-hairline"
        )}
      >
        {options.map((o) => (
          <option key={(o.ItemId ?? o.itemId) as string} value={(o.ItemId ?? o.itemId) as string}>
            {labelFor(o)}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Select
      id={id}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={error ? "border-brand-error" : undefined}
    >
      <option value="">{list.isLoading ? "Loading…" : `Select ${targetSchema.toLowerCase()}…`}</option>
      {options.map((o) => (
        <option key={(o.ItemId ?? o.itemId) as string} value={(o.ItemId ?? o.itemId) as string}>
          {labelFor(o)}
        </option>
      ))}
    </Select>
  );
}
