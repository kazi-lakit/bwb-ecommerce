import { Pencil, Trash2 } from "lucide-react";
import type { EntityMeta } from "@/lib/blocks/schema-meta";
import type { EntityRecord } from "@/lib/blocks/collections";
import { fieldLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateDisplay } from "@/components/ui/date-display";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { isComplexField } from "./field-input";

function displayColumns(meta: EntityMeta) {
  return meta.fields.filter((f) => !isComplexField(f) && !f.isArray).slice(0, 5);
}

function Cell({ field, value }: { field: { name: string; type: string }; value: unknown }) {
  if (value == null || value === "") return <span className="text-muted">—</span>;
  if (field.name === "Status" && typeof value === "string") return <StatusBadge status={value} />;
  if (field.type === "Boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (field.type === "DateTime" && typeof value === "string") return <DateDisplay value={value} />;
  return <span>{String(value)}</span>;
}

export interface ResourceTableProps {
  meta: EntityMeta;
  items: EntityRecord[];
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  /** Resolves a reference field's raw ItemId to a human label — e.g. `{ ParentId: { "<itemId>": "Apparel" } }` for Category. */
  referenceLabels?: Record<string, Record<string, string>>;
}

export function ResourceTable({ meta, items, onEdit, onDelete, referenceLabels }: ResourceTableProps) {
  const columns = displayColumns(meta);

  return (
    <div className="overflow-x-auto rounded-lg border border-hairline">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-hairline bg-surface-soft text-xs uppercase tracking-wide text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.name} className="whitespace-nowrap px-4 py-2.5 font-medium">
                {fieldLabel(c.name)}
              </th>
            ))}
            <th className="w-16 px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const id = (item.ItemId ?? item.itemId) as string;
            return (
              <tr key={id} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft">
                {columns.map((c) => {
                  const raw = item[c.name];
                  const labels = referenceLabels?.[c.name];
                  const resolved = labels && typeof raw === "string" && labels[raw] ? labels[raw] : raw;
                  return (
                    <td key={c.name} className="whitespace-nowrap px-4 py-2.5 text-ink">
                      <Cell field={c} value={resolved} />
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-right">
                  <DropdownMenu
                    items={[
                      { label: "Edit", icon: Pencil, onClick: () => onEdit(item) },
                      { label: "Delete", icon: Trash2, onClick: () => onDelete(item), danger: true },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
