import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

/** Shared header for every public storefront page (catalog, product detail). */
export function StorefrontHeader() {
  const { status } = useAuth();
  return (
    <header className="flex h-16 items-center justify-between border-b border-hairline px-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary">◆</div>
        <span className="font-semibold text-ink">Ecommerce</span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {status === "authenticated" ? (
          <Link to="/admin/product">
            <Button size="sm">Manage products</Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="sm" variant="secondary">
              Staff sign in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
