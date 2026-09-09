import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import type { FieldMeta } from "@/lib/blocks/schema-meta";
import { fieldLabel } from "@/lib/format";

/**
 * Renders one control for a field inside a complex type's shape (Address.City,
 * Media.IsPrimary, TransferItem.Quantity, …). Complex-type shapes only ever contain
 * primitive fields (verified against schema-meta.ts), so this never needs to recurse.
 */
export function SubFieldInput({ field, value, onChange }: { field: FieldMeta; value: unknown; onChange: (value: unknown) => void }) {
  if (field.type === "Boolean") {
    return (
      <Chip selected={Boolean(value)} onClick={() => onChange(!value)}>
        Yes
      </Chip>
    );
  }

  if (field.isArray) {
    const text = Array.isArray(value) ? value.join(", ") : ((value as string) ?? "");
    return (
      <Input
        value={text}
        placeholder="comma, separated"
        className="h-9 text-sm"
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          )
        }
      />
    );
  }

  if (field.type === "Int" || field.type === "Float") {
    return (
      <Input
        type="number"
        step={field.type === "Float" ? "any" : 1}
        className="h-9 text-sm"
        value={value == null ? "" : (value as number | string)}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    );
  }

  if (field.type === "DateTime") {
    return (
      <Input
        type="datetime-local"
        className="h-9 text-sm"
        value={typeof value === "string" ? value.slice(0, 16) : ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      className="h-9 text-sm"
      placeholder={fieldLabel(field.name)}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
