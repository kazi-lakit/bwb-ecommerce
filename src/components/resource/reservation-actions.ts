import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { EntityRecord } from "@/lib/blocks/collections";
import type { LifecycleActionDeps } from "./lifecycle-actions";

/**
 * Guided `InventoryReservation` lifecycle transitions (plan §8.4: Active -> Committed/
 * Released/Expired) instead of hand-typing the Status field. Only offered from "active" —
 * the schema's only valid starting state per the plan — and gated by `canEdit` (today: the
 * `admin`-only placeholder policy on this schema — see `ECOMMERCE_TASK_BREAKDOWN.md` §1.4)
 * since a transition is an edit like any other.
 */
export function reservationActions(record: EntityRecord, deps: LifecycleActionDeps): DropdownMenuItem[] {
  if (!deps.canEdit || record.Status !== "active") return [];
  const itemId = (record.ItemId ?? record.itemId) as string;
  const { onTransition } = deps;
  return [
    {
      label: "Commit",
      icon: CheckCircle2,
      onClick: () => onTransition(itemId, { Status: "committed", CommittedDate: new Date().toISOString() }, "Reservation committed."),
    },
    {
      label: "Release",
      icon: XCircle,
      onClick: () => onTransition(itemId, { Status: "released", ReleasedDate: new Date().toISOString() }, "Reservation released."),
    },
    { label: "Mark expired", icon: Clock, onClick: () => onTransition(itemId, { Status: "expired" }, "Reservation marked expired.") },
  ];
}

/** Same "someone has to notice, there's no scheduler" reasoning as transfers/purchase orders. */
export function reservationRowWarning(record: EntityRecord): string | null {
  if (record.Status !== "active") return null;
  const expires = record.ExpiresDate;
  if (typeof expires !== "string") return null;
  const expiresDate = new Date(expires);
  return !Number.isNaN(expiresDate.getTime()) && expiresDate.getTime() < Date.now() ? "Overdue" : null;
}
