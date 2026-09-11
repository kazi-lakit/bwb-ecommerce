import { CheckCircle2, Lock, PackageCheck, Send, XCircle } from "lucide-react";
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { EntityRecord } from "@/lib/blocks/collections";
import type { LifecycleActionDeps } from "./lifecycle-actions";

/**
 * Guided `PurchaseOrder` lifecycle actions — same shape as `stock-transfer-actions.ts`,
 * keyed off this schema's actual deployed `Status` options
 * (`list-config.ts`'s `STATUS_OPTIONS_BY_SCHEMA.PurchaseOrder`: draft/submitted/approved/
 * partially_received/received/cancelled/closed) rather than every distinct step in the
 * plan's full procurement flow (`ECOMMERCE_POS_PLATFORM_BUILD_PLAN.md` §8.7 — quality
 * inspection, landed costs, supplier returns aren't modeled as states on this schema).
 *
 * Submit/receive are routine, gated only by this schema's actual Edit policy (any
 * authenticated user, `canEdit`). Approve/Close/Cancel are treated as the sensitive,
 * authorization-requiring steps — plan §13 explicitly calls out a Procurement manager role
 * and approval workflows — and gated stricter, on `admin`, an app-level choice that can only
 * be stricter than the backend already allows, never looser.
 */
export function purchaseOrderActions(record: EntityRecord, deps: LifecycleActionDeps): DropdownMenuItem[] {
  const { isAdmin, canEdit, approverIdentity, onTransition } = deps;
  const itemId = (record.ItemId ?? record.itemId) as string;
  const status = record.Status as string | undefined;
  const actions: DropdownMenuItem[] = [];

  if (status === "draft" && canEdit) {
    actions.push({ label: "Submit for approval", icon: Send, onClick: () => onTransition(itemId, { Status: "submitted" }, "Purchase order submitted.") });
  }

  if (status === "submitted" && isAdmin) {
    actions.push({
      label: "Approve",
      icon: CheckCircle2,
      onClick: () =>
        onTransition(
          itemId,
          { Status: "approved", ApprovedBy: approverIdentity ?? "", ApprovedDate: new Date().toISOString() },
          "Purchase order approved."
        ),
    });
  }

  if (status === "approved" && canEdit) {
    actions.push({
      label: "Mark partially received",
      icon: PackageCheck,
      onClick: () => onTransition(itemId, { Status: "partially_received" }, "Marked partially received."),
    });
  }

  if ((status === "approved" || status === "partially_received") && canEdit) {
    actions.push({ label: "Mark received", icon: PackageCheck, onClick: () => onTransition(itemId, { Status: "received" }, "Purchase order received.") });
  }

  if (status === "received" && isAdmin) {
    actions.push({ label: "Close", icon: Lock, onClick: () => onTransition(itemId, { Status: "closed" }, "Purchase order closed.") });
  }

  if (status && ["draft", "submitted", "approved", "partially_received"].includes(status) && isAdmin) {
    actions.push({
      label: "Cancel order",
      icon: XCircle,
      onClick: () => onTransition(itemId, { Status: "cancelled" }, "Purchase order cancelled."),
    });
  }

  return actions;
}

/** Same "someone has to notice, there's no scheduler" reasoning as reservations/transfers. */
export function purchaseOrderRowWarning(record: EntityRecord): string | null {
  const status = record.Status as string | undefined;
  if (!status || !["submitted", "approved", "partially_received"].includes(status)) return null;
  const expected = record.ExpectedDeliveryDate;
  if (typeof expected !== "string") return null;
  const expectedDate = new Date(expected);
  return !Number.isNaN(expectedDate.getTime()) && expectedDate.getTime() < Date.now() ? "Overdue" : null;
}
