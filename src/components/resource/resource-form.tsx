import { useState } from "react";
import type { EntityMeta, FieldMeta } from "@/lib/blocks/schema-meta";
import type { EntityRecord } from "@/lib/blocks/collections";
import { FIELD_SECTIONS } from "@/lib/blocks/field-sections";
import { fieldLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FieldInput, isComplexField } from "./field-input";
import { FormSection } from "./form-section";
import { toFormValues, toPayload, validateFormValues, type FormValues } from "./form-values";

export interface ResourceFormProps {
  meta: EntityMeta;
  record?: EntityRecord | null;
  submitting?: boolean;
  onSubmit: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
}

/** Groups a schema's fields into named sections (see field-sections.ts), or one "General information" section for everything else. */
function sectionsFor(meta: EntityMeta): { title: string; description?: string; fields: FieldMeta[] }[] {
  const configured = FIELD_SECTIONS[meta.schemaName];
  if (!configured) return [{ title: "General information", fields: meta.fields }];

  const byName = new Map(meta.fields.map((f) => [f.name, f]));
  const used = new Set<string>();
  const sections = configured
    .map((section) => {
      const fields = section.fields.map((name) => byName.get(name)).filter((f): f is FieldMeta => Boolean(f));
      fields.forEach((f) => used.add(f.name));
      return { title: section.title, description: section.description, fields };
    })
    .filter((s) => s.fields.length > 0);

  // Defensive: a field schema-meta knows about but this config doesn't mention yet still gets shown.
  const leftover = meta.fields.filter((f) => !used.has(f.name));
  if (leftover.length > 0) sections.push({ title: "Other", description: undefined, fields: leftover });
  return sections;
}

export function ResourceForm({ meta, record, submitting, onSubmit, onCancel }: ResourceFormProps) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(meta, record));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sections = sectionsFor(meta);

  function setField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value as string | boolean }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateFormValues(meta, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalid = meta.fields.find((f) => nextErrors[f.name]);
      document.getElementById(firstInvalid ? `field-${meta.schemaName}-${firstInvalid.name}` : "")?.scrollIntoView({ block: "center" });
      return;
    }
    onSubmit(toPayload(meta, values));
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full min-h-0 flex-col" noValidate>
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5">
        {sections.map((section) => (
          <FormSection key={section.title} title={section.title} description={section.description}>
            {section.fields.map((field) => {
              const complex = isComplexField(field);
              const wide = complex || field.isArray;
              const inputId = `input-${meta.schemaName}-${field.name}`;
              return (
                <div
                  key={field.name}
                  id={`field-${meta.schemaName}-${field.name}`}
                  className={wide ? "sm:col-span-2 flex flex-col gap-1.5" : field.type === "Boolean" ? "" : "flex flex-col gap-1.5"}
                >
                  {field.type !== "Boolean" && (
                    <label htmlFor={complex ? undefined : inputId} className="text-sm font-medium text-ink">
                      {fieldLabel(field.name)}
                      {field.required && (
                        <span className="text-brand-error" aria-label="required">
                          {" "}
                          *
                        </span>
                      )}
                    </label>
                  )}
                  <FieldInput
                    id={inputId}
                    field={field}
                    value={values[field.name]}
                    onChange={(v) => setField(field.name, v)}
                    error={errors[field.name]}
                  />
                  {field.description && <p className="text-xs text-muted">{field.description}</p>}
                  {errors[field.name] && (
                    <p className="text-xs text-brand-error" role="alert">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              );
            })}
          </FormSection>
        ))}
      </div>

      <div className="flex flex-none justify-end gap-2 border-t border-hairline bg-canvas px-6 py-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Spinner className="h-3.5 w-3.5" />}
          {submitting ? "Saving…" : record ? "Save changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}
