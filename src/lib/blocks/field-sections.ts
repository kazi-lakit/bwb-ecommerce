export interface FieldSection {
  title: string;
  description?: string;
  fields: string[];
}

/**
 * Groups a schema's fields into named form sections, purely a presentation grouping —
 * field names/types/validation still come from schema-meta.ts (ENTITY_SCHEMAS), this
 * only decides how ResourceForm lays them out. Entities not listed here get one
 * "General information" section with every field, in schema order (see resource-form.tsx).
 */
export const FIELD_SECTIONS: Record<string, FieldSection[]> = {
  Product: [
    { title: "Basic information", fields: ["Name", "Slug", "ProductType", "Status", "SchemaVersion"] },
    { title: "Description", fields: ["ShortDescription", "LongDescription"] },
    { title: "Categories and brand", fields: ["CategoryIds", "BrandId"] },
    { title: "Media", fields: ["Media"] },
    { title: "Attributes", description: "Shared attributes that apply to every variant.", fields: ["Attributes"] },
    {
      title: "Variant options",
      description: "Options (e.g. color, size) used to build this product's variants.",
      fields: ["VariantOptions", "DefaultVariantId"],
    },
    { title: "Inventory settings", fields: ["IsInventoryTracked", "AllowBackorder"] },
    { title: "SEO information", fields: ["SeoTitle", "SeoDescription", "SeoKeywords"] },
  ],
  Warehouse: [
    { title: "General information", fields: ["Code", "Name", "Type", "Status", "Timezone"] },
    { title: "Address", fields: ["Address"] },
    { title: "Contact", fields: ["Contact"] },
    { title: "Fulfillment settings", fields: ["AllowPickup", "AllowShipping", "FulfillmentPriority"] },
  ],
  Supplier: [
    { title: "General information", fields: ["Code", "Name", "Status", "TaxNumber", "Currency"] },
    { title: "Contact", fields: ["Contact"] },
    { title: "Address", fields: ["Address"] },
    { title: "Payment settings", fields: ["PaymentTermsDays"] },
    { title: "Supplied items", fields: ["Items"] },
  ],
  PurchaseOrder: [
    {
      title: "Order details",
      fields: ["PurchaseOrderNumber", "SupplierId", "WarehouseId", "Status", "OrderDate", "ExpectedDeliveryDate", "Currency"],
    },
    { title: "Line items", fields: ["Items"] },
    { title: "Totals", fields: ["Subtotal", "TaxAmount", "ShippingAmount", "GrandTotal"] },
    { title: "Approval", fields: ["Notes", "ApprovedBy", "ApprovedDate"] },
  ],
  StockTransfer: [
    {
      title: "Transfer details",
      fields: ["TransferNumber", "SourceWarehouseId", "DestinationWarehouseId", "Status", "ExpectedArrivalDate"],
    },
    { title: "Line items", fields: ["Items"] },
    { title: "Approval", fields: ["ApprovedBy", "ApprovedDate"] },
  ],
};
