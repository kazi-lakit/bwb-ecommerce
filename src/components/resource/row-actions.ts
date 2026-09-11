import { Pencil, Trash2 } from "lucide-react";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { EntityRecord } from "@/lib/blocks/collections";

/**
 * Builds the Edit/Delete row-action items respecting `canEdit`/`canDelete` — shared by every
 * table variant (`ResourceTable`, `ProductTable`, `WarehouseCardGrid`) so the gating logic
 * lives in one place. See `list-config.ts`'s `NO_EDIT_SCHEMAS`/`NO_DELETE_SCHEMAS`/
 * `ADMIN_ONLY_EDIT_SCHEMAS` for where the booleans come from.
 */
export function buildRowActions(
  record: EntityRecord,
  onEdit: (record: EntityRecord) => void,
  onDelete: (record: EntityRecord) => void,
  canEdit: boolean,
  canDelete: boolean
): DropdownMenuItem[] {
  const items: DropdownMenuItem[] = [];
  if (canEdit) items.push({ label: "Edit", icon: Pencil, onClick: () => onEdit(record) });
  if (canDelete) items.push({ label: "Delete", icon: Trash2, onClick: () => onDelete(record), danger: true });
  return items;
}
