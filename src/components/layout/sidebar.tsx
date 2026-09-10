import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, PackageOpen, X } from "lucide-react";
import clsx from "clsx";
import { ADMIN_NAV_ITEMS, DASHBOARD_NAV_ITEM } from "./nav-items";

const COLLAPSE_KEY = "admin-sidebar-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

// WarehouseInventory and StockTransfer are managed from inside a specific warehouse
// (WarehouseDetailPage), not as their own top-level list — so they're deliberately
// left out of the nav here even though their schemas still exist.
const GROUPS = [
  { label: "Catalog", schemas: ["Product", "Category", "Brand"] },
  { label: "Inventory", schemas: ["Warehouse", "InventoryReservation", "InventoryMovement"] },
  { label: "Procurement", schemas: ["Supplier", "PurchaseOrder"] },
];

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function NavSection({ label, children, collapsed }: { label: string; children: ReactNode; collapsed: boolean }) {
  return (
    <div className="mt-5 first:mt-1">
      {!collapsed && <p className="mb-2 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-muted">{label}</p>}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // Sidebar state remains session-only when storage is unavailable.
    }
  }, [collapsed]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "relative flex min-h-11 items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
      collapsed && "justify-center px-2",
      isActive
        ? "bg-brand-accent-soft text-brand-accent before:absolute before:-right-3 before:top-0 before:h-full before:w-1 before:rounded-l-full before:bg-brand-accent"
        : "text-steel hover:bg-surface hover:text-ink"
    );

  const content = (
    <>
      <div className={clsx("flex h-[5.25rem] flex-none items-center gap-3 px-6", collapsed && "justify-center px-3")}>
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-brand-accent text-on-dark shadow-sm">
          <PackageOpen size={20} strokeWidth={2.4} />
        </div>
        {!collapsed && <span className="truncate text-xl font-semibold tracking-tight text-ink">BWB Commerce</span>}
        <button type="button" onClick={onCloseMobile} aria-label="Close navigation" className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-steel hover:bg-surface md:hidden">
          <X size={18} />
        </button>
        {!collapsed && (
          <button type="button" onClick={() => setCollapsed(true)} aria-label="Collapse navigation" className="ml-auto hidden h-7 w-7 items-center justify-center rounded-full bg-brand-accent text-white shadow-sm md:flex">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <NavSection label="Store management" collapsed={collapsed}>
          <NavLink to="/admin" end className={linkClass} title="Dashboard">
            <DASHBOARD_NAV_ITEM.icon size={19} className="flex-none" />
            {!collapsed && "Dashboard"}
          </NavLink>
        </NavSection>

        {GROUPS.map((group) => (
          <NavSection key={group.label} label={group.label} collapsed={collapsed}>
            {group.schemas.map((schemaName) => {
              const item = ADMIN_NAV_ITEMS.find((candidate) => candidate.schemaName === schemaName);
              if (!item) return null;
              return (
                <NavLink key={item.schemaName} to={`/admin/${item.slug}`} className={linkClass} title={item.label}>
                  <item.icon size={19} className="flex-none" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </NavSection>
        ))}
      </nav>

      {collapsed && (
        <div className="border-t border-hairline px-3 py-4">
          <button type="button" onClick={() => setCollapsed(false)} className="hidden min-h-11 w-full items-center justify-center rounded-md text-brand-accent hover:bg-brand-accent-soft md:flex" aria-label="Expand navigation">
            <ChevronLeft size={18} className="rotate-180" />
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <aside className={clsx("sticky top-0 z-30 hidden h-screen flex-none flex-col bg-canvas shadow-[2px_0_8px_rgba(67,89,113,0.08)] transition-[width] duration-200 md:flex", collapsed ? "w-20" : "w-[16.25rem]")}>
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-overlay backdrop-blur-[1px]" onClick={onCloseMobile} />
          <aside className="relative flex h-full w-[17rem] flex-col bg-canvas shadow-2xl" onClick={(event) => event.stopPropagation()}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
