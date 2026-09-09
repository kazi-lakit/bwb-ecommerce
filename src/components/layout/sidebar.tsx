import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, ExternalLink, X } from "lucide-react";
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

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      // Private browsing / storage disabled — collapse state just won't persist.
    }
  }, [collapsed]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium",
      collapsed && "justify-center px-2",
      isActive ? "bg-primary text-on-primary" : "text-steel hover:bg-surface hover:text-ink"
    );

  const content = (
    <>
      <div className={clsx("flex h-16 flex-none items-center gap-2 border-b border-hairline px-6", collapsed && "justify-center px-2")}>
        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-on-primary">◆</div>
        {!collapsed && <span className="truncate font-semibold text-ink">Ecommerce</span>}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-steel hover:bg-surface md:hidden"
        >
          <X size={16} />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <NavLink to="/admin" end className={linkClass} title="Dashboard">
          <DASHBOARD_NAV_ITEM.icon size={17} className="flex-none" />
          {!collapsed && "Dashboard"}
        </NavLink>
        <div className={clsx("my-2 border-t border-hairline", collapsed && "mx-1")} />
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink key={item.schemaName} to={`/admin/${item.slug}`} className={linkClass} title={item.label}>
            <item.icon size={17} className="flex-none" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-0.5 border-t border-hairline p-3">
        <Link
          to="/"
          className={clsx(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-steel hover:bg-surface hover:text-ink",
            collapsed && "justify-center px-2"
          )}
          title="View storefront"
        >
          <ExternalLink size={16} className="flex-none" />
          {!collapsed && "View storefront"}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={clsx(
            "hidden w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-steel hover:bg-surface hover:text-ink md:flex",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={clsx(
          "hidden flex-none flex-col border-r border-hairline bg-surface-soft transition-[width] duration-150 md:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onCloseMobile} />
          <aside className="relative flex h-full w-64 flex-col border-r border-hairline bg-surface-soft" onClick={(e) => e.stopPropagation()}>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
