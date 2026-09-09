import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Providers } from "@/components/providers/providers";
import { useAuth } from "@/components/providers/auth-provider";
import { startLogin } from "@/lib/blocks/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Spinner } from "@/components/ui/spinner";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import HomePage from "@/pages/HomePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import DashboardPage from "@/pages/DashboardPage";
import WarehouseDetailPage from "@/pages/WarehouseDetailPage";
import ResourceListPage from "@/pages/ResourceListPage";

function Loading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  );
}

/** There's no standalone /login page — hitting a protected route while signed out goes straight into the SSO redirect. */
function RedirectToLogin({ returnTo }: { returnTo: string }) {
  useEffect(() => {
    void startLogin(returnTo);
  }, [returnTo]);
  return <Loading />;
}

/**
 * `/admin/*` is the staff management console — every entity's create/update/delete
 * goes through here, gated behind a validated IAM session (`useAuth`, backed by
 * `GET /iam/v4/iam/me` against the session cookie). An anonymous visitor is sent
 * straight into the hosted SSO flow (see RedirectToLogin above) before any admin query
 * fires. This is deliberately separate from the public storefront at "/" (see
 * HomePage.tsx): Product reads are configured Public on the Data Gateway (anyone can
 * browse the catalog with no session), but writing to Product — and reading or writing
 * every other entity here — requires authentication, enforced server-side by each
 * schema's own Write/Read access level, not just by this client-side guard.
 */
function ProtectedLayout() {
  const { status } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (status === "loading") return <Loading />;
  if (status === "unauthenticated") return <RedirectToLogin returnTo={location.pathname} />;
  return (
    <div className="flex min-h-screen flex-1 bg-admin-canvas">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobile={() => setMobileNavOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/login/callback" element={<AuthCallbackPage />} />
          <Route path="/admin" element={<ProtectedLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="warehouse/:warehouseId" element={<WarehouseDetailPage />} />
            <Route path=":entity" element={<ResourceListPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
