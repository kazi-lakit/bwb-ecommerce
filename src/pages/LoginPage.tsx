import { Navigate } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { startLogin } from "@/lib/blocks/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * The only public route. This app is the staff console — the public catalog now lives
 * in its own app (`ecommerce-consumer`) — so an anonymous visitor here has nothing to
 * browse, just a way to sign in. Login stays user-initiated (click "Staff sign in")
 * rather than auto-redirecting; a signed-out visit to a protected `/admin` route still
 * auto-redirects on its own (see App.tsx's RedirectToLogin) since there's an explicit
 * destination to return to once signed in.
 */
export default function LoginPage() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (status === "authenticated") return <Navigate to="/admin" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="admin-card w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-on-dark shadow-sm">
          <PackageOpen size={24} strokeWidth={2.4} />
        </div>
        <h1 className="text-lg font-semibold text-ink">BWB Commerce</h1>
        <p className="mt-1 text-sm text-muted">Staff console for product and inventory management.</p>
        <Button className="mt-6 w-full" onClick={() => void startLogin()}>
          Staff sign in
        </Button>
      </div>
    </div>
  );
}
