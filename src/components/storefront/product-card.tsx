import { Link } from "react-router-dom";
import type { EntityRecord } from "@/lib/blocks/collections";
import { getPrimaryImage } from "@/lib/blocks/media";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

export interface ProductCardProps {
  product: EntityRecord;
  /** Abstract placeholder image (see src/lib/placeholder-images.ts) — shown immediately if there's no real photo, or swapped in if the real one fails to load. */
  placeholderImage: string;
}

export function ProductCard({ product, placeholderImage }: ProductCardProps) {
  const image = getPrimaryImage(product);
  const name = (product.Name as string) || "Untitled product";
  const slug = (product.Slug as string) || (product.ItemId as string) || (product.itemId as string);
  const shortDescription = product.ShortDescription as string | undefined;
  const status = product.Status as string | undefined;
  const productType = product.ProductType as string | undefined;

  return (
    <Link to={`/product/${slug}`} className="block">
      <Card className="flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
        <div className="aspect-square overflow-hidden rounded-md bg-surface">
          <ImageWithFallback
            src={image?.Url}
            fallback={placeholderImage}
            alt={image?.AltText || name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-ink">{name}</h3>
          {shortDescription && <p className="line-clamp-2 text-xs text-steel">{shortDescription}</p>}
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {status && <Badge>{status}</Badge>}
            {productType && <Badge>{productType}</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
