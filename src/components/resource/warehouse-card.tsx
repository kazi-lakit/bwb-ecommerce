import { Link } from "react-router-dom";
import { Mail, MapPin, Pencil, Phone, Trash2, Warehouse as WarehouseIcon } from "lucide-react";
import type { EntityRecord } from "@/lib/blocks/collections";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { BooleanIndicator } from "@/components/ui/boolean-indicator";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export interface Address {
  Line1?: string;
  Line2?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  CountryCode?: string;
}

export interface Contact {
  Name?: string;
  Email?: string;
  Phone?: string;
}

export function formatAddress(address: Address | undefined): string | null {
  if (!address) return null;
  const line1 = [address.Line1, address.Line2].filter(Boolean).join(", ");
  const line2 = [address.City, address.State, address.PostalCode].filter(Boolean).join(", ");
  const parts = [line1, line2, address.CountryCode].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export interface WarehouseCardGridProps {
  items: EntityRecord[];
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
}

/**
 * Warehouses read better as cards than as a table row: an address and a contact don't
 * compress into a single cell without becoming unreadable, and there are usually few
 * enough warehouses that a grid doesn't need a table's density. Each card links to
 * that warehouse's own detail page (WarehouseDetailPage) — its scoped inventory and
 * dashboard live there, not in a modal.
 */
export function WarehouseCardGrid({ items, onEdit, onDelete }: WarehouseCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((warehouse) => {
        const id = (warehouse.ItemId ?? warehouse.itemId) as string;
        const address = formatAddress(warehouse.Address as Address | undefined);
        const contact = warehouse.Contact as Contact | undefined;
        const timezone = warehouse.Timezone as string | undefined;
        const fulfillmentPriority = warehouse.FulfillmentPriority as number | undefined;

        return (
          <Link key={id} to={`/admin/warehouse/${id}`} className="block">
            <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-brand-accent-soft text-brand-accent">
                    <WarehouseIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{(warehouse.Name as string) || "Untitled warehouse"}</p>
                    <p className="truncate text-xs text-muted">{warehouse.Code as string}</p>
                  </div>
                </div>
                {/* Stop the card-level Link from firing when the actions menu is used. */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <DropdownMenu
                    items={[
                      { label: "Edit", icon: Pencil, onClick: () => onEdit(warehouse) },
                      { label: "Delete", icon: Trash2, onClick: () => onDelete(warehouse), danger: true },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {warehouse.Status ? <StatusBadge status={warehouse.Status as string} /> : null}
                {warehouse.Type ? <Badge>{warehouse.Type as string}</Badge> : null}
              </div>

              {address && (
                <p className="flex items-start gap-1.5 text-sm text-steel">
                  <MapPin size={14} className="mt-0.5 flex-none text-muted" />
                  <span>{address}</span>
                </p>
              )}

              {contact && (contact.Name || contact.Email || contact.Phone) && (
                <div className="space-y-1 text-sm text-steel">
                  {contact.Name && <p className="text-ink">{contact.Name}</p>}
                  {contact.Email && (
                    <p className="flex items-center gap-1.5">
                      <Mail size={14} className="flex-none text-muted" /> {contact.Email}
                    </p>
                  )}
                  {contact.Phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={14} className="flex-none text-muted" /> {contact.Phone}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-3 text-xs">
                <BooleanIndicator value={Boolean(warehouse.AllowPickup)} label="Pickup" />
                <BooleanIndicator value={Boolean(warehouse.AllowShipping)} label="Shipping" />
                {fulfillmentPriority != null && <span className="text-muted">Priority {fulfillmentPriority}</span>}
                {timezone && <span className="text-muted">{timezone}</span>}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
