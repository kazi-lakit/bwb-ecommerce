import { createBlocksClient } from "@seliseblocks/client";
import { blocksConfig } from "./config";

/**
 * One cookie-backed Blocks SDK instance. No access or refresh token is copied into
 * browser storage — the browser carries the HttpOnly IAM session cookie, and the SDK
 * adds `x-blocks-key` plus `credentials: "include"` on every request. This is the same
 * pattern as dms-app's `src/lib/blocks/client.ts`. All product/inventory reads and
 * writes go through this one client; the server enforces access per schema (Product
 * reads are configured Public — see HomePage.tsx — every other read, and every write
 * including Product's, requires the signed-in session this client carries), so the
 * `/admin` UI guard (App.tsx) is a convenience, not the actual security boundary.
 */
export const blocksClient = createBlocksClient({
  apiUrl: blocksConfig.apiUrl,
  appDomain: blocksConfig.appDomain,
  xBlocksKey: blocksConfig.projectKey,
  oidc: blocksConfig.oidc,
});
