import { Pencil, Trash2 } from "lucide-react";
import type { EntityMeta } from "@/lib/blocks/schema-meta";
import type { EntityRecord } from "@/lib/blocks/collections";
import { fieldLabel } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateDisplay } from "@/components/ui/date-display";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { isComplexField } from "./field-input";

function displayColumns(meta: EntityMeta, hiddenFields: string[]) {
  return meta.fields.filter((f) => !isComplexField(f) && !f.isArray && !hiddenFields.includes(f.name)).slice(0, 5);
}

function Cell({ field, value, unresolvedId }: { field: { name: string; type: string }; value: unknown; unresolvedId?: boolean }) {
  if (value == null || value === "") return <span className="text-muted">—</span>;
  if (field.name === "Status" && typeof value === "string") return <StatusBadge status={value} />;
  if (field.type === "Boolean") return <span>{value ? "Yes" : "No"}</span>;
  if (field.type === "DateTime" && typeof value === "string") return <DateDisplay value={value} />;
  // An id-shaped field with nothing to resolve it against (no matching entity in this data
  // model, e.g. InventoryReservation.CustomerId): display it as a code — consistently,
  // whether the underlying value happens to be a raw GUID or a readable code like
  // "CUSTOMER-DEMO-001" — rather than one looking like plain prose and the other like a
  // stray hash. Only very long values (GUIDs) truncate; the full value is one hover/tap away.
  if (unresolvedId && typeof value === "string") {
    const isLong = value.length > 24;
    return (
      <span className="font-mono text-xs text-steel" title={value}>
        {isLong ? `${value.slice(0, 20)}…` : value}
      </span>
    );
  }
  return <span>{String(value)}</span>;
}

export interface ResourceTableProps {
  meta: EntityMeta;
  items: EntityRecord[];
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  /** Resolves a reference field's raw ItemId to a human label — e.g. `{ ParentId: { "<itemId>": "Apparel" } }` for Category. */
  referenceLabels?: Record<string, Record<string, string>>;
  /** Field names to exclude from the (up to 5) displayed columns — e.g. hide WarehouseId when the table is already scoped to one warehouse. */
  hiddenFields?: string[];
}

export function ResourceTable({ meta, items, onEdit, onDelete, referenceLabels, hiddenFields = [] }: ResourceTableProps) {
  const columns = displayColumns(meta, hiddenFields);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-hairline text-xs uppercase tracking-wide text-steel">
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
              <tr key={id} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft/70">
                {columns.map((c) => {
                  const raw = item[c.name];
                  const labels = referenceLabels?.[c.name];
                  const hasLabel = Boolean(labels && typeof raw === "string" && labels[raw]);
                  const resolved = hasLabel ? labels![raw as string] : raw;
                  const unresolvedId = !hasLabel && /Id$/.test(c.name) && typeof raw === "string";
                  return (
                    <td key={c.name} className="whitespace-nowrap px-4 py-2.5 text-ink">
                      <Cell field={c} value={resolved} unresolvedId={unresolvedId} />
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
