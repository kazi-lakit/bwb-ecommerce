import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldMeta } from "@/lib/blocks/schema-meta";
import { isComplexFieldType } from "@/lib/blocks/schema-meta";
import { REFERENCE_FIELD_TARGETS } from "@/lib/blocks/reference-fields";
import { ObjectFieldset } from "./object-fieldset";
import { RepeaterField } from "./repeater-field";
import { ReferenceSelect } from "./reference-select";

const LONG_TEXT_HINT = /description|notes/i;

export function isComplexField(field: FieldMeta): boolean {
  return isComplexFieldType(field.type);
}

export interface FieldInputProps {
  field: FieldMeta;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  /** Wired to the section label's `htmlFor` — only used for fields that render one native control. */
  id?: string;
}

/** Renders one form control for a schema field, chosen by its FieldMeta.type/isArray. */
export function FieldInput({ field, value, onChange, error, id }: FieldInputProps) {
  if (isComplexField(field)) {
    const json = (value as string) ?? (field.isArray ? "[]" : "{}");
    return field.isArray ? (
      <RepeaterField field={field} value={json} onChange={onChange} />
    ) : (
      <ObjectFieldset field={field} value={json} onChange={onChange} />
    );
  }

  if (field.type === "Boolean") {
    return (
      <label className="flex h-10 items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-hairline"
        />
        Enabled
      </label>
    );
  }

  const referenceTarget = REFERENCE_FIELD_TARGETS[field.name];
  if (referenceTarget) {
    return (
      <ReferenceSelect id={id} targetSchema={referenceTarget} isArray={field.isArray} value={value} onChange={onChange} error={error} />
    );
  }

  if (field.isArray) {
    return (
      <Input
        id={id}
        value={(value as string) ?? ""}
        placeholder="comma, separated, values"
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-brand-error" : undefined}
      />
    );
  }

  if (field.type === "Int" || field.type === "Float") {
    return (
      <Input
        id={id}
        type="number"
        step={field.type === "Float" ? "any" : 1}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-brand-error" : undefined}
      />
    );
  }

  if (field.type === "DateTime") {
    return (
      <Input
        id={id}
        type="datetime-local"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-brand-error" : undefined}
      />
    );
  }

  if (LONG_TEXT_HINT.test(field.name)) {
    return (
      <Textarea
        id={id}
        rows={3}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-brand-error" : undefined}
      />
    );
  }

  return (
    <Input
      id={id}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={error ? "border-brand-error" : undefined}
    />
  );
}
