import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useEntityList } from "@/lib/blocks/hooks";
import { assignPlaceholders } from "@/lib/placeholder-images";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ProductCard } from "@/components/storefront/product-card";
import { StorefrontHeader } from "@/components/storefront/storefront-header";

const PAGE_SIZE = 24;
const ALL = "";

/**
 * The public storefront. Product's ReadAccessLevel is configured as Public on the Data
 * Gateway, so this route renders outside `ProtectedLayout` and fetches products with no
 * session required — an anonymous visitor sees the full catalog. Creating, editing, or
 * deleting a product still requires signing in (see /admin, gated by ProtectedLayout in
 * App.tsx and by Product's WriteAccessLevel on the server).
 */
export default function HomePage() {
  const { theme } = useTheme();
  const [pageNo, setPageNo] = useState(1);
  const [brandId, setBrandId] = useState(ALL);
  const [categoryId, setCategoryId] = useState(ALL);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);

  // Brand/Category names for the filter dropdowns. If either isn't readable
  // anonymously, its dropdown just quietly stays empty — filtering by that field
  // still works if the visitor typed/selected nothing, it only loses its option list.
  const brands = useEntityList("Brand", { pageNo: 1, pageSize: 200 });
  const categories = useEntityList("Category", { pageNo: 1, pageSize: 200 });
  const brandOptions = useMemo(
    () => [...(brands.data?.items ?? [])].sort((a, b) => String(a.Name).localeCompare(String(b.Name))),
    [brands.data]
  );
  const categoryOptions = useMemo(
    () => [...(categories.data?.items ?? [])].sort((a, b) => String(a.Name).localeCompare(String(b.Name))),
    [categories.data]
  );

  // Built as the Data Gateway's generated `<Schema>FilterInput`: per-field operators
  // (eq/contains/...), multiple top-level fields implicitly AND'd, `or` for the
  // name-or-description search below.
  const where = useMemo(() => {
    const w: Record<string, unknown> = {};
    if (brandId) w.BrandId = { eq: brandId };
    if (categoryId) w.CategoryIds = { contains: categoryId };
    if (search) {
      w.or = [{ Name: { contains: search } }, { ShortDescription: { contains: search } }];
    }
    return Object.keys(w).length > 0 ? w : undefined;
  }, [brandId, categoryId, search]);

  const list = useEntityList("Product", { pageNo, pageSize: PAGE_SIZE, where });

  const items = list.data?.items ?? [];
  const totalCount = list.data?.totalCount ?? 0;
  const hasNextPage = pageNo * PAGE_SIZE < totalCount;
  const hasFilters = brandId !== ALL || categoryId !== ALL || search !== "";

  function selectBrand(value: string) {
    setBrandId(value);
    setPageNo(1);
  }
  function selectCategory(value: string) {
    setCategoryId(value);
    setPageNo(1);
  }
  function updateSearch(value: string) {
    setSearchInput(value);
    setPageNo(1);
  }
  function clearFilters() {
    setBrandId(ALL);
    setCategoryId(ALL);
    setSearchInput("");
    setPageNo(1);
  }

  // Recomputed only when the fetched item set changes, so a placeholder doesn't
  // reshuffle on every unrelated re-render — but a fresh, still-random assignment each
  // time the catalog page actually changes.
  const placeholders = useMemo(() => assignPlaceholders(items, theme), [items, theme]);

  return (
    <div className="min-h-screen bg-canvas">
      <StorefrontHeader />

      <main className="mx-auto max-w-6xl p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-ink">Products</h1>
            <p className="text-sm text-muted">{totalCount} available</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                value={searchInput}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-52 pl-9"
              />
            </div>
            <Select
              value={categoryId}
              onChange={(e) => selectCategory(e.target.value)}
              className="w-44"
              aria-label="Filter by category"
            >
              <option value={ALL}>All categories</option>
              {categoryOptions.map((c) => (
                <option key={(c.ItemId ?? c.itemId) as string} value={(c.ItemId ?? c.itemId) as string}>
                  {c.Name as string}
                </option>
              ))}
            </Select>
            <Select value={brandId} onChange={(e) => selectBrand(e.target.value)} className="w-44" aria-label="Filter by brand">
              <option value={ALL}>All brands</option>
              {brandOptions.map((b) => (
                <option key={(b.ItemId ?? b.itemId) as string} value={(b.ItemId ?? b.itemId) as string}>
                  {b.Name as string}
                </option>
              ))}
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {list.isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            {hasFilters ? "No products match these filters." : "No products to show yet."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((product, i) => (
                <ProductCard
                  key={(product.ItemId ?? product.itemId) as string}
                  product={product}
                  placeholderImage={placeholders[i]}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-muted">Page {pageNo}</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={pageNo <= 1} onClick={() => setPageNo((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={!hasNextPage} onClick={() => setPageNo((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
