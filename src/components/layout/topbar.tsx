import { Menu, LogOut } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { ADMIN_NAV_ITEMS } from "./nav-items";
import { titleCase } from "@/lib/format";

function useAdminBreadcrumbs(): Crumb[] {
  const { entity } = useParams<{ entity?: string }>();
  if (!entity) return [{ label: "Dashboard" }];
  const item = ADMIN_NAV_ITEMS.find((i) => i.slug === entity);
  return [{ label: "Dashboard", to: "/admin" }, { label: item?.label ?? titleCase(entity) }];
}

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, logout } = useAuth();
  const breadcrumbs = useAdminBreadcrumbs();

  return (
    <header className="flex h-16 flex-none items-center gap-3 border-b border-hairline px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Open navigation"
        className="flex h-9 w-9 flex-none items-center justify-center rounded-md text-steel hover:bg-surface hover:text-ink md:hidden"
      >
        <Menu size={18} />
      </button>
      <Breadcrumbs items={breadcrumbs} />
      <div className="ml-auto flex items-center gap-3">
        {user && <span className="hidden text-sm text-steel sm:inline">{user.email}</span>}
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={() => void logout()} title="Sign out" aria-label="Sign out">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}
