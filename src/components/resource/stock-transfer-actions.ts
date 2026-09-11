import { CheckCircle2, PackageCheck, Truck, XCircle } from "lucide-react";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { EntityRecord } from "@/lib/blocks/collections";
import type { LifecycleActionDeps } from "./lifecycle-actions";

/**
 * Guided `StockTransfer` lifecycle actions, matching the deployed schema's actual `Status`
 * options (`list-config.ts`'s `STATUS_OPTIONS_BY_SCHEMA.StockTransfer`) rather than the
 * plan's fuller Draft→Requested→Approved→Picking→Dispatched→InTransit→PartiallyReceived→
 * Received→Closed lifecycle (`ECOMMERCE_POS_PLATFORM_BUILD_PLAN.md` §8.6) — this schema
 * consolidates several of those into fewer states, so the actions offered here are the ones
 * that actually correspond to a real status value, not an idealized fuller model.
 *
 * Approve/Cancel are gated stricter than this schema's actual `EditAccessLevel` (which
 * allows any authenticated user) — an app-level choice, not a backend one, treating
 * approval/cancellation as more sensitive than routine dispatch/receive. Always safe: this
 * can only be stricter than what the backend already allows, never looser.
 */
export function stockTransferActions(record: EntityRecord, deps: LifecycleActionDeps): DropdownMenuItem[] {
  const { isAdmin, canEdit, approverIdentity, onTransition } = deps;
  const itemId = (record.ItemId ?? record.itemId) as string;
  const status = record.Status as string | undefined;
  const actions: DropdownMenuItem[] = [];

  if (status === "draft" && isAdmin) {
    actions.push({
      label: "Approve",
      icon: CheckCircle2,
      onClick: () =>
        onTransition(
          itemId,
          { Status: "approved", ApprovedBy: approverIdentity ?? "", ApprovedDate: new Date().toISOString() },
          "Transfer approved."
        ),
    });
  }

  if (status === "approved" && canEdit) {
    actions.push({ label: "Dispatch", icon: Truck, onClick: () => onTransition(itemId, { Status: "in_transit" }, "Transfer dispatched.") });
  }

  if (status === "in_transit" && canEdit) {
    actions.push({
      label: "Mark partially received",
      icon: PackageCheck,
      onClick: () => onTransition(itemId, { Status: "partially_received" }, "Marked partially received."),
    });
  }

  if ((status === "in_transit" || status === "partially_received") && canEdit) {
    actions.push({ label: "Mark received", icon: PackageCheck, onClick: () => onTransition(itemId, { Status: "received" }, "Transfer received.") });
  }

  if (status && ["draft", "approved", "in_transit", "partially_received"].includes(status) && isAdmin) {
    actions.push({ label: "Cancel transfer", icon: XCircle, onClick: () => onTransition(itemId, { Status: "cancelled" }, "Transfer cancelled.") });
  }

  return actions;
}

/**
 * Same "someone has to notice, there's no scheduler" reasoning as the reservation-expiry
 * warning (`ECOMMERCE_PLATFORM_ON_BLOCKS.md` §6.3) — a transfer still in flight past its own
 * `ExpectedArrivalDate` is flagged rather than silently sitting there.
 */
export function stockTransferRowWarning(record: EntityRecord): string | null {
  const status = record.Status as string | undefined;
  if (!status || !["approved", "in_transit", "partially_received"].includes(status)) return null;
  const expected = record.ExpectedArrivalDate;
  if (typeof expected !== "string") return null;
  const expectedDate = new Date(expected);
  return !Number.isNaN(expectedDate.getTime()) && expectedDate.getTime() < Date.now() ? "Overdue" : null;
}
