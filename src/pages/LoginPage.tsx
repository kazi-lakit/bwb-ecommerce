import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/providers/auth-provider";
import { startLogin } from "@/lib/blocks/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const messages: Record<string, string> = { callback_failed: "We couldn't complete sign-in. Please try again." };

export default function LoginPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  useEffect(() => {
    if (status === "authenticated") navigate("/admin", { replace: true });
  }, [status, navigate]);
  const error = params.get("error");
  const returnTo = (location.state as { from?: string } | null)?.from || "/admin";
  return (
    <div className="flex min-h-screen flex-col">
      <div className="relative flex flex-1 items-center justify-center bg-surface px-6 py-24">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-sm shadow-xl">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary">◆</div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Ecommerce</h1>
            <p className="text-sm text-steel">Sign in to manage products &amp; inventory</p>
          </div>
          {error && (
            <p className="mb-4 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-brand-error">
              {messages[error] || "Something went wrong. Please try again."}
            </p>
          )}
          {status === "loading" ? (
            <div className="flex items-center justify-center py-2.5">
              <Spinner />
            </div>
          ) : (
            <Button className="w-full" onClick={() => void startLogin(returnTo)}>
              Sign in with SSO
            </Button>
          )}
          <p className="mt-6 text-center text-xs text-muted">
            Anyone can browse the product catalog. Creating, editing, or deleting products and inventory records requires
            a signed-in staff account.
          </p>
        </Card>
      </div>
    </div>
  );
}
