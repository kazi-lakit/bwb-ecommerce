import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { startLogin } from "@/lib/blocks/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

/** Shared header for every public storefront page (catalog, product detail) — same brand mark/name as the admin sidebar. */
export function StorefrontHeader() {
  const { status } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-brand-accent text-on-dark shadow-sm">
          <PackageOpen size={20} strokeWidth={2.4} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-ink">BWB Commerce</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {status === "authenticated" ? (
          <Link to="/admin/product">
            <Button size="sm">Manage products</Button>
          </Link>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => void startLogin()}>
            Staff sign in
          </Button>
        )}
      </div>
    </header>
  );
}
