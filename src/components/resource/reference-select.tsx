import { useMemo } from "react";
import clsx from "clsx";
import { useEntityList } from "@/lib/blocks/hooks";
import { entityLabel } from "@/lib/format";
import { Select } from "@/components/ui/select";
import { Chip } from "@/components/ui/chip";

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
    () => [...(list.data?.items ?? [])].sort((a, b) => entityLabel(a).localeCompare(entityLabel(b))),
    [list.data]
  );

  if (isArray) {
    const selected = typeof value === "string" ? value.split(",").map((s) => s.trim()).filter(Boolean) : [];

    function toggle(optionId: string) {
      const next = selected.includes(optionId) ? selected.filter((v) => v !== optionId) : [...selected, optionId];
      onChange(next.join(", "));
    }

    return (
      <div
        id={id}
        role="group"
        className={clsx(
          "flex flex-wrap gap-2 rounded-md border bg-surface-soft p-3",
          error ? "border-brand-error" : "border-hairline"
        )}
      >
        {options.length === 0 && (
          <span className="text-sm text-muted">{list.isLoading ? "Loading…" : `No ${targetSchema.toLowerCase()}s yet.`}</span>
        )}
        {options.map((o) => {
          const optionId = (o.ItemId ?? o.itemId) as string;
          return (
            <Chip key={optionId} selected={selected.includes(optionId)} onClick={() => toggle(optionId)}>
              {entityLabel(o)}
            </Chip>
          );
        })}
      </div>
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
          {entityLabel(o)}
        </option>
      ))}
    </Select>
  );
}
