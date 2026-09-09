# Ecommerce frontend

This is a Vite + React 19 single-page application, structured the same way as the
sibling `dms-app`: React Router for navigation and the Blocks SDK/cookie-backed OIDC
flow in `src/lib/blocks/`. Do not add a local authentication backend or persist Blocks
tokens in browser storage.

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
