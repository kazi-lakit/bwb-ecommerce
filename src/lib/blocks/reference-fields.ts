/**
 * Fields that hold another entity's ItemId — mapped to which schema to pick from, so
 * the form can offer a select of names instead of asking the user to paste a raw GUID.
 * The stored/submitted value is still just the ItemId string (or array of them), so
 * this doesn't change payload shape at all.
 */
export const REFERENCE_FIELD_TARGETS: Record<string, string> = {
  BrandId: "Brand",
  CategoryIds: "Category",
  ParentId: "Category",
  ProductId: "Product",
  WarehouseId: "Warehouse",
  SourceWarehouseId: "Warehouse",
  DestinationWarehouseId: "Warehouse",
  SupplierId: "Supplier",
  VariantId: "ProductVariant",
  DefaultVariantId: "ProductVariant",
};
