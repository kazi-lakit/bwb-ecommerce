import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import type { FieldMeta } from "@/lib/blocks/schema-meta";
import { fieldLabel } from "@/lib/format";
import { ImageUploadField } from "./image-upload-field";

/**
 * Renders one control for a field inside a complex type's shape (Address.City,
 * Media.IsPrimary, TransferItem.Quantity, …). Complex-type shapes only ever contain
 * primitive fields (verified against schema-meta.ts), so this never needs to recurse.
 *
 * `parentTypeName` is the containing complex type (e.g. `"Media"`) — used only to special-case
 * `Media.Url` with a real upload control instead of a raw text input for a URL string.
 */
export function SubFieldInput({
  field,
  value,
  onChange,
  parentTypeName,
}: {
  field: FieldMeta;
  value: unknown;
  onChange: (value: unknown) => void;
  parentTypeName?: string;
}) {
  if (parentTypeName === "Media" && field.name === "Url") {
    return <ImageUploadField value={(value as string) ?? ""} onChange={onChange} />;
  }

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
