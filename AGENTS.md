# Ecommerce frontend

This is a Vite + React 19 single-page application, structured the same way as the
sibling `dms-app`: React Router for navigation and the Blocks SDK/cookie-backed OIDC
flow in `src/lib/blocks/`. Do not add a local authentication backend or persist Blocks
tokens in browser storage.

Access-token expiry is handled by `onUnauthorized` on the SDK instance in
`src/lib/blocks/client.ts`: on a 401, it calls `blocksClient.auth.refresh()` (IAM's
AuthController, not the OIDC token endpoint — that one needs an explicit
`refresh_token` we never have in JS) so the browser's HttpOnly refresh-token cookie
does the work and IAM rotates the access-token cookie via `Set-Cookie`; the SDK then
retries the original call once. This applies to every call made through
`blocksClient.http.request` — IAM routes and Data Gateway GraphQL calls alike, since
`BlocksDataClient` is built on the same http client. `src/lib/blocks/auth.ts`'s
`withSessionRefresh` is the fallback for the one case this can't fix — the refresh
token itself has also expired — where it dispatches `SESSION_EXPIRED_EVENT` to sign
the user out.

## Deployment (Docker / Blocks OS)

The app builds and runs in a container via the standard Blocks OS convention
(same setup as `beef-app-react` — see its CLAUDE.md deployment notes).

- **`Dockerfile`** — multi-stage: a `node:22-alpine` builder stage runs `npm ci` then
  `npm run build:${ci_build}` (the `ci_build` build-arg selects the environment,
  e.g. `dev`), then copies the output into `nginxinc/nginx-unprivileged:1.29-alpine`,
  serving on port 8080 via `nginx.conf` (plain SPA config: gzip +
  `try_files $uri $uri/ /index.html`).
- Vite's default `dist/` output is what gets copied (`COPY --from=builder /app/dist`).
- **`set-env.cjs`** + `package.json`'s `build:dev`/`build:stg`/`build:prod` scripts:
  each sets `BUILD_ENV`, runs `set-env.cjs` (copies `.env.${BUILD_ENV}` to `.env`),
  then `tsc -b && vite build`. **Local-build caveat:** this repo's local env file is
  `.env.local`, which Vite ranks *above* `.env` — so running `npm run build:dev`
  locally bakes your `.env.local` values, not `.env.dev`'s. The Docker build is
  unaffected (`.dockerignore` excludes `.env.local`); don't run `build:*` locally
  expecting deployed values.
- **`.env.dev`** is tracked in git (un-ignored in `.gitignore` alongside
  `.env.example`) so fresh CI checkouts can build. It still has a placeholder
  `VITE_BLOCKS_APP_DOMAIN` — replace it with the real deployed domain and register
  `https://<deployed-domain>/login/callback` as a redirect URI on the OIDC client
  before the first deploy. If updating via `blocks auth oidc-clients save`, resend
  every field — it replaces, not merges.

## Data model

`src/lib/blocks/schema-meta.ts` is generated from `../ECOMMERCE_INVENTORY_SCHEMAS.json`
(the project's Data schema export) via `scripts/gen-schema-meta.mjs` — regenerate it
with `node scripts/gen-schema-meta.mjs` if that source file changes. Do not hand-edit
`schema-meta.ts`.

The exported JSON's numeric access-level fields (`ReadAccessLevel` etc.) don't map to
fixed labels documented anywhere in this repo — treat the live project config as the
source of truth, not the export. Confirmed live: **Product reads are Public** (the
storefront at `/`, `src/pages/HomePage.tsx`, fetches with no session); every write, and
every read/write on the other ten entities (`Brand`, `Category`, `ProductVariant`,
`Warehouse`, `WarehouseInventory`, `InventoryReservation`, `InventoryMovement`,
`StockTransfer`, `Supplier`, `PurchaseOrder`), requires the authenticated session
enforced under `/admin` (`src/App.tsx`). If you change access levels on the Data
Gateway, update `HomePage.tsx`/`App.tsx` and the README to match — the route guards
here don't derive from the schema automatically.

`src/components/resource/` is a generic, schema-driven CRUD table/form used for all
eleven entities under `/admin` so field lists stay in sync with the schema instead of
being hand-maintained per entity. Nested/complex fields (`Media`, `Attributes`,
`Pricing`, `Dimensions`, etc.) are edited as raw JSON in the form — there is no
per-field sub-form for those yet.
