import { CheckCircle2, ExternalLink, Pencil, Trash2, XCircle } from "lucide-react";
import type { EntityRecord } from "@/lib/blocks/collections";
import { getPrimaryImage } from "@/lib/blocks/media";
import { Thumbnail } from "@/components/ui/thumbnail";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { DateDisplay } from "@/components/ui/date-display";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

export interface ProductTableProps {
  items: EntityRecord[];
  categoryNames: Record<string, string>;
  brandNames: Record<string, string>;
  placeholders: string[];
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
}

function BooleanIndicator({ value, label }: { value: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-steel">
      {value ? <CheckCircle2 size={14} className="text-brand-success" /> : <XCircle size={14} className="text-muted" />}
      {label}
    </span>
  );
}

/**
 * The Products table specifically — richer than the generic ResourceTable because
 * product rows need an image, resolved category/brand names (not raw ids), and two
 * boolean flags shown as icons (never color alone).
 */
export function ProductTable({ items, categoryNames, brandNames, placeholders, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-hairline text-xs uppercase tracking-wide text-steel">
          <tr>
            <th className="px-4 py-2.5 font-medium">Product</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Category</th>
            <th className="px-4 py-2.5 font-medium">Brand</th>
            <th className="px-4 py-2.5 font-medium">Inventory</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Updated</th>
            <th className="w-16 px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((product, i) => {
            const id = (product.ItemId ?? product.itemId) as string;
            const image = getPrimaryImage(product);
            const categoryIds = Array.isArray(product.CategoryIds) ? (product.CategoryIds as string[]) : [];
            const categoryLabel = categoryIds.map((c) => categoryNames[c] ?? c).join(", ") || "—";
            const brandLabel = product.BrandId ? (brandNames[product.BrandId as string] ?? String(product.BrandId)) : "—";
            const slug = (product.Slug as string) || id;

            return (
              <tr key={id} className="border-b border-hairline-soft last:border-0 hover:bg-surface-soft/70">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <Thumbnail src={image?.Url} fallback={placeholders[i]} alt={(product.Name as string) || "Product"} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{(product.Name as string) || "Untitled product"}</p>
                      <p className="truncate text-xs text-muted">{product.Slug as string}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  {product.ProductType ? <Badge>{product.ProductType as string}</Badge> : <span className="text-muted">—</span>}
                </td>
                <td className="max-w-[14rem] truncate px-4 py-2.5 text-ink">{categoryLabel}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-ink">{brandLabel}</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <BooleanIndicator value={Boolean(product.IsInventoryTracked)} label="Tracked" />
                    <BooleanIndicator value={Boolean(product.AllowBackorder)} label="Backorder" />
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  {product.Status ? <StatusBadge status={product.Status as string} /> : <span className="text-muted">—</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <DateDisplay value={product.LastUpdatedDate as string} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <DropdownMenu
                    items={[
                      { label: "View on storefront", icon: ExternalLink, onClick: () => window.open(`/product/${slug}`, "_blank") },
                      { label: "Edit", icon: Pencil, onClick: () => onEdit(product) },
                      { label: "Delete", icon: Trash2, onClick: () => onDelete(product), danger: true },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
