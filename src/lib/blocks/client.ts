import { createBlocksClient } from "@seliseblocks/client";
import { blocksConfig } from "./config";

let refreshPromise: Promise<string | undefined> | null = null;

/**
 * Refreshes the session when a protected call 401s because the access token expired.
 * The session lives entirely in HttpOnly cookies (see the client doc below), so there's
 * no refresh token in reach of this code to read or send explicitly — `POST
 * /iam/v4/auth/refresh` relies on the browser attaching the HttpOnly refresh-token
 * cookie itself (every SDK request already sends `credentials: "include"`), and IAM
 * rotates the access-token cookie via `Set-Cookie` on success. That cookie swap is what
 * actually recovers the session; the `access_token` string returned here just satisfies
 * `onUnauthorized`'s contract so the SDK retries the original call instead of treating a
 * missing return value as "session unrecoverable" (see `BlocksClientConfig.onUnauthorized`
 * in `@seliseblocks/client`). Concurrent 401s (e.g. WarehouseDetailPage's several parallel
 * queries) share one in-flight refresh instead of each firing their own.
 */
function refreshAccessToken(): Promise<string | undefined> {
  if (!refreshPromise) {
    refreshPromise = blocksClient.auth
      .refresh()
      .then((response) => {
        if (!response || response.error) return undefined;
        return response.access_token ?? response.accessToken ?? "session-refreshed";
      })
      .catch(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * One cookie-backed Blocks SDK instance. No access or refresh token is copied into
 * browser storage — the browser carries the HttpOnly IAM session cookie, and the SDK
 * adds `x-blocks-key` plus `credentials: "include"` on every request. This is the same
 * pattern as dms-app's `src/lib/blocks/client.ts`. This app is the staff console only
 * (the public catalog lives in the separate `ecommerce-consumer` app) — every read and
 * write here goes through this one client and requires the signed-in session it
 * carries, enforced server-side per schema regardless of the `/admin` UI guard
 * (App.tsx).
 *
 * `onUnauthorized` wires in the access-token refresh flow above. It applies uniformly to
 * every call this client makes through `blocksClient.http.request` — both plain IAM
 * routes (`blocksFetch` in `./http.ts`) and Data Gateway GraphQL calls (`blocksClient.data.graphql`,
 * used by every entity's CRUD in `./collections.ts`) — since `BlocksDataClient` is itself
 * built on the same `http.request`. `./auth.ts`'s `withSessionRefresh` still wraps calls on
 * top of this for the separate case this refresh can't fix: the refresh token itself has
 * also expired, at which point it dispatches `SESSION_EXPIRED_EVENT` to sign the user out.
 */
export const blocksClient = createBlocksClient({
  apiUrl: blocksConfig.apiUrl,
  appDomain: blocksConfig.appDomain,
  xBlocksKey: blocksConfig.projectKey,
  oidc: blocksConfig.oidc,
  onUnauthorized: refreshAccessToken,
});
