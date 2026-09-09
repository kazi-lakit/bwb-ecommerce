import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  ArrowLeftRight,
  Bookmark,
  Boxes,
  Building2,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  Package,
  Tag,
  Truck,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { ENTITY_ORDER } from "@/lib/blocks/schema-meta";
import { titleCase } from "@/lib/format";

export function slugFor(schemaName: string): string {
  return schemaName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function pluralTitle(schemaName: string): string {
  const title = titleCase(schemaName);
  return title.endsWith("y") ? `${title.slice(0, -1)}ies` : `${title}s`;
}

const ICON_BY_SCHEMA: Record<string, ComponentType<LucideProps>> = {
  Product: Package,
  Category: FolderTree,
  Brand: Tag,
  Warehouse: WarehouseIcon,
  WarehouseInventory: Boxes,
  InventoryReservation: Bookmark,
  InventoryMovement: ArrowLeftRight,
  StockTransfer: Truck,
  Supplier: Building2,
  PurchaseOrder: ClipboardList,
};

/** Friendlier nav labels than a bare pluralized schema name, for the sidebar/breadcrumbs. */
const LABEL_BY_SCHEMA: Record<string, string> = {
  WarehouseInventory: "Inventory",
  InventoryReservation: "Reservations",
  InventoryMovement: "Inventory Movements",
};

export interface NavItem {
  schemaName: string;
  slug: string;
  label: string;
  icon: ComponentType<LucideProps>;
}

export const ADMIN_NAV_ITEMS: NavItem[] = ENTITY_ORDER.filter((name) => name !== "ProductVariant").map((schemaName) => ({
  schemaName,
  slug: slugFor(schemaName),
  label: LABEL_BY_SCHEMA[schemaName] ?? pluralTitle(schemaName),
  icon: ICON_BY_SCHEMA[schemaName] ?? Package,
}));

export const DASHBOARD_NAV_ITEM = { slug: "", label: "Dashboard", icon: LayoutDashboard };
