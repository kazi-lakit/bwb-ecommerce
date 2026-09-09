import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEntityList } from "@/lib/blocks/hooks";
import { getPrimaryImage } from "@/lib/blocks/media";
import { assignPlaceholders } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Spinner } from "@/components/ui/spinner";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { useTheme } from "@/components/providers/theme-provider";

interface MediaItem {
  MediaId?: string;
  Url?: string;
  AltText?: string;
  IsPrimary?: boolean;
  Type?: string;
}

interface AttributeItem {
  Code?: string;
  Name?: string;
  Value?: string;
}

interface Pricing {
  Currency?: string;
  RegularPrice?: number;
  SalePrice?: number;
}

interface OptionValue {
  Code?: string;
  Name?: string;
  Value?: string;
}

interface VariantPrice {
  current: string;
  /** The pre-sale price, formatted — only set when SalePrice actually undercuts RegularPrice. */
  original?: string;
}

function getVariantPrice(pricing: Pricing | undefined): VariantPrice | null {
  if (!pricing || typeof pricing.RegularPrice !== "number") return null;
  const currency = pricing.Currency ? `${pricing.Currency} ` : "";
  const hasSale = typeof pricing.SalePrice === "number" && pricing.SalePrice < pricing.RegularPrice;
  return {
    current: `${currency}${(hasSale ? pricing.SalePrice! : pricing.RegularPrice).toFixed(2)}`,
    original: hasSale ? `${currency}${pricing.RegularPrice.toFixed(2)}` : undefined,
  };
}

/**
 * Public product detail page — same access story as HomePage.tsx: Product reads are
 * configured Public, so this renders with no session required. Routed by `Slug`
 * (unique per Product, meant for URLs) rather than `ItemId`.
 */
export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const productList = useEntityList("Product", { where: { Slug: { eq: slug } }, pageSize: 1 }, Boolean(slug));
  const product = productList.data?.items[0];
  const productId = (product?.ItemId ?? product?.itemId) as string | undefined;

  const variantList = useEntityList(
    "ProductVariant",
    { where: { ProductId: { eq: productId } }, pageSize: 50 },
    Boolean(productId)
  );
  const variants = variantList.data?.items ?? [];

  const placeholder = useMemo(() => (product ? assignPlaceholders([product], theme)[0] : ""), [product, theme]);

  if (productList.isLoading) {
    return (
      <div className="min-h-screen bg-canvas">
        <StorefrontHeader />
        <div className="flex justify-center py-24">
          <Spinner className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (!slug) return <Navigate to="/" replace />;

  if (!product) {
    return (
      <div className="min-h-screen bg-canvas">
        <StorefrontHeader />
        <div className="mx-auto max-w-3xl p-6 text-center">
          <p className="py-16 text-sm text-muted">This product doesn't exist, or isn't available anymore.</p>
          <Link to="/" className="text-sm font-medium text-brand-accent hover:underline">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  const media = (Array.isArray(product.Media) ? (product.Media as MediaItem[]) : []).filter((m) => m.Url);
  const primary = getPrimaryImage(product);
  const mainImage = activeImage ?? primary?.Url ?? null;
  const attributes = Array.isArray(product.Attributes) ? (product.Attributes as AttributeItem[]) : [];
  const name = (product.Name as string) || "Untitled product";

  // The headline price: the product's DefaultVariantId if it has one, else the first
  // variant — matches DefaultVariantId's own description ("Default sellable variant").
  const defaultVariant = variants.find((v) => (v.ItemId ?? v.itemId) === product.DefaultVariantId) ?? variants[0];
  const headlinePrice = getVariantPrice(defaultVariant?.Pricing as Pricing | undefined);

  return (
    <div className="min-h-screen bg-canvas">
      <StorefrontHeader />
      <main className="mx-auto max-w-5xl p-6">
        <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-sm text-steel hover:text-ink">
          <ArrowLeft size={15} /> Back to catalog
        </Link>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-surface">
              <ImageWithFallback
                src={mainImage}
                fallback={placeholder}
                alt={primary?.AltText || name}
                className="h-full w-full object-cover"
              />
            </div>
            {media.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {media.map((m) => (
                  <button
                    key={m.MediaId ?? m.Url}
                    onClick={() => setActiveImage(m.Url ?? null)}
                    className="h-16 w-16 flex-none overflow-hidden rounded-md border border-hairline bg-surface"
                  >
                    <ImageWithFallback src={m.Url} fallback={placeholder} alt={m.AltText || name} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-ink">{name}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.Status ? <Badge>{product.Status as string}</Badge> : null}
                {product.ProductType ? <Badge>{product.ProductType as string}</Badge> : null}
              </div>
            </div>

            {variantList.isLoading ? (
              <Spinner className="h-5 w-5" />
            ) : headlinePrice ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-ink">{headlinePrice.current}</span>
                {headlinePrice.original && <span className="text-sm text-muted line-through">{headlinePrice.original}</span>}
              </div>
            ) : null}

            {product.ShortDescription ? <p className="text-sm text-steel">{product.ShortDescription as string}</p> : null}
            {product.LongDescription ? (
              <p className="whitespace-pre-line text-sm text-steel">{product.LongDescription as string}</p>
            ) : null}

            {attributes.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-ink">Details</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {attributes.map((a) => (
                    <div key={a.Code} className="contents">
                      <dt className="text-muted">{a.Name || a.Code}</dt>
                      <dd className="text-ink">{a.Value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {!variantList.isLoading && variants.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold text-ink">Options</h2>
                <div className="space-y-2">
                  {variants.map((v) => {
                    const optionValues = Array.isArray(v.OptionValues) ? (v.OptionValues as OptionValue[]) : [];
                    const price = getVariantPrice(v.Pricing as Pricing | undefined);
                    return (
                      <div
                        key={(v.ItemId ?? v.itemId) as string}
                        className="flex items-center justify-between rounded-md border border-hairline px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-ink">{(v.Name as string) || (v.Sku as string)}</p>
                          {optionValues.length > 0 && (
                            <p className="text-xs text-muted">{optionValues.map((o) => o.Value).join(" / ")}</p>
                          )}
                        </div>
                        {price && (
                          <span className="flex items-baseline gap-1.5 font-medium text-ink">
                            {price.current}
                            {price.original && <span className="text-xs text-muted line-through">{price.original}</span>}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
