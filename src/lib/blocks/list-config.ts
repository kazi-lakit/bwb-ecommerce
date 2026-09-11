/**
 * Per-schema list-page config: which field a search box should `contains`-filter on,
 * and which literal Status values (taken straight from each schema's own field
 * description in schema-meta.ts, never guessed) are worth offering as a filter
 * dropdown. An entity missing from either map just doesn't get that control.
 */
export const SEARCH_FIELD_BY_SCHEMA: Record<string, string> = {
  Product: "Name",
  Brand: "Name",
  Category: "Name",
  Warehouse: "Name",
  Supplier: "Name",
  ProductVariant: "Sku",
  WarehouseInventory: "Sku",
  InventoryReservation: "ReservationNumber",
  InventoryMovement: "MovementNumber",
  StockTransfer: "TransferNumber",
  PurchaseOrder: "PurchaseOrderNumber",
};

export const STATUS_OPTIONS_BY_SCHEMA: Record<string, string[]> = {
  Product: ["draft", "active", "inactive", "archived"],
  Brand: ["active", "inactive", "archived"],
  Supplier: ["active", "inactive", "blocked"],
  InventoryReservation: ["active", "committed", "released", "expired"],
  StockTransfer: ["draft", "approved", "in_transit", "partially_received", "received", "cancelled"],
  PurchaseOrder: ["draft", "submitted", "approved", "partially_received", "received", "cancelled", "closed"],
};

/**
 * Mirrors the Data Gateway access policies (live today, or drafted in
 * `P0_POLICY_FIXES.json` at the workspace root) so the UI doesn't offer an action the
 * backend will just 403 on — and, for `InventoryMovement`, so the ledger reads as immutable
 * in the app, not only in policy. Keep this in sync if those policies change.
 *
 * - `InventoryMovement`: no Edit policy at all (correctly, by design — see
 *   `ECOMMERCE_TASK_BREAKDOWN.md` §1.2), and its Delete-allow policy is meant to be removed
 *   entirely, not merely role-gated. Hide both, unconditionally, for everyone including admins.
 * - `WarehouseInventory` / `InventoryReservation`: Edit is fixed to an admin-only placeholder
 *   policy (real inventory-role scoping is a Phase 0 follow-up) — gate Edit on the `admin` role.
 * - Every other live schema's Delete already carries an "only admin can delete data" policy —
 *   gate Delete on `admin` everywhere except the no-delete schemas above.
 */
export const NO_EDIT_SCHEMAS = new Set(["InventoryMovement"]);
export const NO_DELETE_SCHEMAS = new Set(["InventoryMovement"]);
export const ADMIN_ONLY_EDIT_SCHEMAS = new Set(["WarehouseInventory", "InventoryReservation"]);
