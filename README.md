# Ecommerce — product & inventory management on SELISE Blocks

A React 19 single-page application, built the same way as the sibling `dms-app`, for
managing the product/inventory catalog described in `../ECOMMERCE_INVENTORY_SCHEMAS.json`:
Brands, Categories, Products, Product Variants, Warehouses, Warehouse Inventory,
Inventory Reservations, Inventory Movements, Stock Transfers, Suppliers, and Purchase
Orders.

## Authentication

- The app uses the cookie-backed Blocks hosted OIDC flow, identical to `dms-app`:
  `src/lib/blocks/client.ts` owns the one SDK client; `auth.ts` starts hosted login and
  completes the `/login/callback` browser route. No access or refresh token is stored
  in localStorage, sessionStorage, or a custom app cookie.
- `AuthProvider` (`src/components/providers/auth-provider.tsx`) validates the IAM
  session cookie through Blocks (`GET /iam/v4/iam/me`).
- **Two areas, two access levels:**
  - `/` (`src/pages/HomePage.tsx`) is the **public storefront**. Product's
    `ReadAccessLevel` is configured as Public on the Data Gateway, so this route
    renders outside any auth guard and lists the full catalog to anonymous visitors.
  - `/admin/*` (`src/App.tsx`, `ProtectedLayout`) is the **staff management console** —
    create/update/delete for Product, and full read+write for every other entity
    (Brand, Category, Warehouse, inventory, suppliers, purchase orders, …). An
    unauthenticated visitor is redirected to `/login` before any admin query fires.
- **Enforcement is server-side, not just a client-side redirect:** each schema's own
  Read/Write/Edit/Delete access level on the Data Gateway is what actually decides
  whether a request succeeds — the `/admin` route guard is a convenience, not the
  security boundary. If a schema's configured access level changes, update the guard
  and copy here to match.
- All CRUD goes through `blocksClient.data.collection(schemaName)` (see
  `src/lib/blocks/collections.ts`), the SDK's generated-GraphQL helper — never a raw
  `fetch`/`curl` against the gateway.

## Setup

Create `.env.local` with the public browser configuration (see `.env.example`):

```bash
VITE_BLOCKS_API_URL=https://blocksapi.dev.slsblx.com
VITE_BLOCKS_PROJECT_KEY=<project tenant key>
VITE_BLOCKS_APP_DOMAIN=<your app domain>
VITE_BLOCKS_OIDC_CLIENT_ID=<public OIDC client id>
VITE_BLOCKS_OIDC_URL=<OIDC authority URL>
VITE_BLOCKS_OIDC_SCOPE=openid profile

VITE_BLOCKS_DEV_HOST=dntdxj.dev.slsblx.com
VITE_BLOCKS_DEV_PORT=5173
```

This app runs at `https://dntdxj.dev.slsblx.com` — the same dev host (and, by default,
the same port) `dms-app` already uses, and already has registered as a redirect URI on
the shared Blocks OIDC client, so no new client/redirect-URI registration is needed if
you run one app at a time. If `dms-app` is already set up on this machine, its hosts
file entry and `.cert/` already cover this app too; otherwise add `127.0.0.1
dntdxj.dev.slsblx.com` to your hosts file and generate the certificate below. Only
override `VITE_BLOCKS_DEV_PORT` (and register the new port as an additional redirect
URI) if you need both apps running at once.

```bash
npm install
npm run cert
npm run dev:https
npm run build
```

## Structure

```text
src/App.tsx                        router and protected application shell
src/pages/                         login, callback, and the generic resource list page
src/lib/blocks/client.ts           configured Blocks SDK client
src/lib/blocks/auth.ts             hosted OIDC and 401 handling
src/lib/blocks/http.ts             session-refresh + business-error wrapping
src/lib/blocks/schema-meta.ts      generated field metadata (see AGENTS.md)
src/lib/blocks/collections.ts      generic CRUD per schema via blocksClient.data.collection
src/lib/blocks/hooks.ts            TanStack Query hooks over collections.ts
src/components/resource/           schema-driven table/form used for every entity
src/components/layout/             sidebar + topbar
```
