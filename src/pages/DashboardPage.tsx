import { Boxes, Building2, ClipboardList, FolderTree, Package, PackageCheck, Tag, Truck, Warehouse as WarehouseIcon } from "lucide-react";
import { useEntityList } from "@/lib/blocks/hooks";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryCard } from "@/components/dashboard/summary-card";

// Real enum values from the schema (see schema-meta.ts) — not guesses. "Pending"/"low
// stock" aren't literal status strings, so these approximate them as "not yet finished".
const IN_PROGRESS_TRANSFER_STATUSES = ["draft", "approved", "in_transit", "partially_received"];
const OPEN_PURCHASE_ORDER_STATUSES = ["draft", "submitted", "approved", "partially_received"];

function useCount(schemaName: string, where?: Record<string, unknown>) {
  const query = useEntityList(schemaName, { pageSize: 1, where });
  return { value: query.data?.totalCount, loading: query.isLoading };
}

/**
 * Every card here is backed by a real `totalCount` from the Data Gateway (a cheap
 * `pageSize: 1` list call) — no client-side aggregation, no fabricated numbers.
 * Available/Reserved inventory and Low-stock counts are intentionally NOT shown: they'd
 * need either a backend sum/aggregation over WarehouseInventory or a cross-field
 * comparison (AvailableToSell vs ReorderPoint) that the Data Gateway's filter operators
 * don't support — fetching and summing all rows client-side wouldn't be accurate at
 * scale, so per the brief ("don't display misleading values") they're left out until
 * that's available server-side.
 */
export default function DashboardPage() {
  const totalProducts = useCount("Product");
  const activeProducts = useCount("Product", { Status: { eq: "active" } });
  const warehouses = useCount("Warehouse");
  const categories = useCount("Category");
  const brands = useCount("Brand");
  const suppliers = useCount("Supplier");
  const inProgressTransfers = useCount("StockTransfer", { Status: { in: IN_PROGRESS_TRANSFER_STATUSES } });
  const openPurchaseOrders = useCount("PurchaseOrder", { Status: { in: OPEN_PURCHASE_ORDER_STATUSES } });

  return (
    <div className="pb-2 pt-1">
      <PageHeader title="eCommerce Dashboard" description="An overview of your catalog, inventory, and purchasing operations." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total products" icon={Package} to="/admin/product" {...totalProducts} />
        <SummaryCard label="Active products" icon={PackageCheck} to="/admin/product" {...activeProducts} />
        <SummaryCard label="Warehouses" icon={WarehouseIcon} to="/admin/warehouse" {...warehouses} />
        <SummaryCard label="Categories" icon={FolderTree} to="/admin/category" {...categories} />
        <SummaryCard label="Brands" icon={Tag} to="/admin/brand" {...brands} />
        <SummaryCard label="Suppliers" icon={Building2} to="/admin/supplier" {...suppliers} />
        <SummaryCard label="In-progress transfers" icon={Truck} to="/admin/stock-transfer" {...inProgressTransfers} />
        <SummaryCard label="Open purchase orders" icon={ClipboardList} to="/admin/purchase-order" {...openPurchaseOrders} />
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-lg bg-canvas px-4 py-3 text-xs text-muted shadow-[var(--shadow-float)]">
        <Boxes size={13} /> Available/reserved inventory and low-stock counts need a backend aggregation over
        WarehouseInventory that isn't exposed yet — not shown here to avoid guessing.
      </p>
    </div>
  );
}
