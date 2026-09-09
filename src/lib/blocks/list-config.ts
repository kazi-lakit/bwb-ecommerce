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
