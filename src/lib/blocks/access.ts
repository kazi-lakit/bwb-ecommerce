import { useAuth } from "@/components/providers/auth-provider";

/**
 * Feature-gating by the signed-in user's own IAM roles/permissions — read-only, no special
 * confirmation needed (matches the `blocks-iam-access-control` skill's "Facet 1" pattern).
 * `AuthProvider` already fetches `roles`/`permissions` from `/iam/v4/iam/me` via `usersApi.me()`
 * (see `users.ts`) — this was fetched but never consulted anywhere in the app until now.
 *
 * No custom IAM roles/permissions have necessarily been created for this project yet (that's
 * `blocks iam roles/permissions create` work, left to the user per this project's
 * CLI-stays-user-owned convention) — these hooks work with whatever the signed-in user's
 * token actually carries, including just the built-in `admin` role.
 */

export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.roles?.includes(role) ?? false;
}

export function useHasPermission(permission: string): boolean {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) ?? false;
}
