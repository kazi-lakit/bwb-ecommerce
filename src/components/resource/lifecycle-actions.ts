import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { EntityRecord } from "@/lib/blocks/collections";
import { reservationActions, reservationRowWarning } from "./reservation-actions";
import { stockTransferActions, stockTransferRowWarning } from "./stock-transfer-actions";
import { purchaseOrderActions, purchaseOrderRowWarning } from "./purchase-order-actions";

/** Shared by every schema's guided lifecycle actions — see reservation/stock-transfer/purchase-order-actions.ts. */
export interface LifecycleActionDeps {
  isAdmin: boolean;
  canEdit: boolean;
  /** Recorded on an `ApprovedBy`-style field, where the schema has one. */
  approverIdentity?: string;
  onTransition: (itemId: string, payload: Record<string, unknown>, successMessage: string) => void;
}

export type LifecycleActionsFn = (record: EntityRecord, deps: LifecycleActionDeps) => DropdownMenuItem[];
export type RowWarningFn = (record: EntityRecord) => string | null;

/**
 * One registry per schema instead of a growing `if (schemaName === ...)` chain in
 * `ResourceListPage.tsx` — add a schema here (and its own `<schema>-actions.ts` module) the
 * next time this pattern is needed, rather than extending a chain of sequential ifs.
 */
export const LIFECYCLE_ACTIONS_BY_SCHEMA: Record<string, LifecycleActionsFn> = {
  InventoryReservation: reservationActions,
  StockTransfer: stockTransferActions,
  PurchaseOrder: purchaseOrderActions,
};

export const ROW_WARNING_BY_SCHEMA: Record<string, RowWarningFn> = {
  InventoryReservation: reservationRowWarning,
  StockTransfer: stockTransferRowWarning,
  PurchaseOrder: purchaseOrderRowWarning,
};
