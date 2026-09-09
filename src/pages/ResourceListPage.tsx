import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { ENTITY_ORDER } from "@/lib/blocks/schema-meta";
import { getEntityMeta, type EntityRecord } from "@/lib/blocks/collections";
import { useEntityList, useEntityMutations } from "@/lib/blocks/hooks";
import { SEARCH_FIELD_BY_SCHEMA, STATUS_OPTIONS_BY_SCHEMA } from "@/lib/blocks/list-config";
import { REFERENCE_FIELD_TARGETS } from "@/lib/blocks/reference-fields";
import { slugFor } from "@/components/layout/nav-items";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { assignPlaceholders } from "@/lib/placeholder-images";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Drawer } from "@/components/ui/drawer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ResourceTable } from "@/components/resource/resource-table";
import { ProductTable } from "@/components/resource/product-table";
import { ResourceForm } from "@/components/resource/resource-form";
import { toast } from "@/lib/toast-store";
import { entityLabel, fieldLabel, titleCase } from "@/lib/format";

const SLUG_TO_SCHEMA: Record<string, string> = Object.fromEntries(ENTITY_ORDER.map((name) => [slugFor(name), name]));

const PAGE_SIZE = 20;

function humanizeStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export default function ResourceListPage() {
  const { entity } = useParams<{ entity: string }>();
  const { theme } = useTheme();
  const schemaName = entity ? SLUG_TO_SCHEMA[entity] : undefined;

  const [pageNo, setPageNo] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);

  const [editing, setEditing] = useState<EntityRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EntityRecord | null>(null);

  const meta = useMemo(() => (schemaName ? getEntityMeta(schemaName) : undefined), [schemaName]);
  const searchField = schemaName ? SEARCH_FIELD_BY_SCHEMA[schemaName] : undefined;
  const statusOptions = (schemaName ? STATUS_OPTIONS_BY_SCHEMA[schemaName] : undefined) ?? [];

  const where = useMemo(() => {
    const w: Record<string, unknown> = {};
    if (search && searchField) w[searchField] = { contains: search };
    if (statusFilter) w.Status = { eq: statusFilter };
    return Object.keys(w).length > 0 ? w : undefined;
  }, [search, searchField, statusFilter]);

  const list = useEntityList(schemaName ?? "", { pageNo, pageSize: PAGE_SIZE, where });
  const mutations = useEntityMutations(schemaName ?? "");

  const isProduct = schemaName === "Product";

  // Every reference field (WarehouseId, ProductId, VariantId, BrandId, CategoryIds,
  // ParentId, SupplierId, …) resolves to the target record's name instead of showing a
  // raw ItemId — in every entity's table, not just Category/Product. Fetches the full
  // target collection (not just this page) since the referenced record may live on a
  // different page than the one currently displayed. A fixed set of hooks — one per
  // possible target schema — each just toggled on/off by `enabled` depending on
  // whether the entity being viewed actually has a field pointing at that schema.
  const neededTargets = useMemo(() => {
    const set = new Set<string>();
    for (const field of meta?.fields ?? []) {
      const target = REFERENCE_FIELD_TARGETS[field.name];
      if (target) set.add(target);
    }
    return set;
  }, [meta]);

  const brandsForLookup = useEntityList("Brand", { pageSize: 200 }, neededTargets.has("Brand"));
  const categoriesForLookup = useEntityList("Category", { pageSize: 200 }, neededTargets.has("Category"));
  const warehousesForLookup = useEntityList("Warehouse", { pageSize: 200 }, neededTargets.has("Warehouse"));
  const productsForLookup = useEntityList("Product", { pageSize: 200 }, neededTargets.has("Product"));
  const variantsForLookup = useEntityList("ProductVariant", { pageSize: 200 }, neededTargets.has("ProductVariant"));
  const suppliersForLookup = useEntityList("Supplier", { pageSize: 200 }, neededTargets.has("Supplier"));

  const lookupsBySchema = useMemo(() => {
    function nameMap(records: EntityRecord[]): Record<string, string> {
      const byId: Record<string, string> = {};
      for (const record of records) {
        const id = (record.ItemId ?? record.itemId) as string | undefined;
        if (id) byId[id] = entityLabel(record);
      }
      return byId;
    }
    return {
      Brand: nameMap(brandsForLookup.data?.items ?? []),
      Category: nameMap(categoriesForLookup.data?.items ?? []),
      Warehouse: nameMap(warehousesForLookup.data?.items ?? []),
      Product: nameMap(productsForLookup.data?.items ?? []),
      ProductVariant: nameMap(variantsForLookup.data?.items ?? []),
      Supplier: nameMap(suppliersForLookup.data?.items ?? []),
    } as Record<string, Record<string, string>>;
  }, [
    brandsForLookup.data,
    categoriesForLookup.data,
    warehousesForLookup.data,
    productsForLookup.data,
    variantsForLookup.data,
    suppliersForLookup.data,
  ]);

  const referenceLabels = useMemo(() => {
    const result: Record<string, Record<string, string>> = {};
    for (const field of meta?.fields ?? []) {
      const target = REFERENCE_FIELD_TARGETS[field.name];
      if (target) result[field.name] = lookupsBySchema[target];
    }
    return result;
  }, [meta, lookupsBySchema]);

  const items = list.data?.items ?? [];
  const placeholders = useMemo(() => (isProduct ? assignPlaceholders(items, theme) : []), [isProduct, items, theme]);

  if (!schemaName || !meta) return <Navigate to="/" replace />;

  const totalCount = list.data?.totalCount ?? 0;
  const hasNextPage = pageNo * PAGE_SIZE < totalCount;
  const hasFilters = Boolean(searchInput) || Boolean(statusFilter);
  const label = titleCase(schemaName);

  function closeModals() {
    setEditing(null);
    setCreating(false);
    setDeleting(null);
  }

  function updateSearch(value: string) {
    setSearchInput(value);
    setPageNo(1);
  }

  function updateStatus(value: string) {
    setStatusFilter(value);
    setPageNo(1);
  }

  function clearFilters() {
    setSearchInput("");
    setStatusFilter("");
    setPageNo(1);
  }

  function handleCreate(payload: Record<string, unknown>) {
    mutations.create.mutate(payload, {
      onSuccess: () => {
        toast.success(`${label} created.`);
        closeModals();
      },
    });
  }

  function handleUpdate(payload: Record<string, unknown>) {
    if (!editing) return;
    const itemId = (editing.ItemId ?? editing.itemId) as string;
    mutations.update.mutate(
      { itemId, payload },
      {
        onSuccess: () => {
          toast.success(`${label} updated.`);
          closeModals();
        },
      }
    );
  }

  function handleDelete() {
    if (!deleting) return;
    mutations.remove.mutate(deleting, {
      onSuccess: () => {
        toast.success(`${label} deleted.`);
        closeModals();
      },
    });
  }

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus size={16} /> New {label}
    </Button>
  );

  return (
    <div className="pb-2 pt-1">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", to: "/admin" }, { label: `${label}s` }]}
        title={`${label}s`}
        description={`Manage ${label.toLowerCase()} records, details, and status.`}
      />

      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-hairline px-5 py-5 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            {searchField && (
              <SearchInput
                value={searchInput}
                onChange={(e) => updateSearch(e.target.value)}
                placeholder={`Search by ${fieldLabel(searchField).toLowerCase()}…`}
                aria-label={`Search ${label.toLowerCase()}s`}
                className="w-full sm:w-72"
              />
            )}
            {statusOptions.length > 0 && (
              <Select value={statusFilter} onChange={(e) => updateStatus(e.target.value)} className="w-full sm:w-44" aria-label="Filter by status">
                <option value="">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{humanizeStatus(s)}</option>
                ))}
              </Select>
            )}
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
          </div>
          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <span className="text-sm text-muted">{totalCount} total</span>
            {newButton}
          </div>
        </div>

        {list.isLoading ? (
          <div className="p-5"><TableSkeleton columns={isProduct ? 7 : 5} /></div>
        ) : list.isError ? (
          <div className="p-5"><ErrorState message={list.error instanceof Error ? list.error.message : undefined} onRetry={() => list.refetch()} /></div>
        ) : items.length === 0 ? (
          <div className="p-5"><EmptyState title={hasFilters ? "No matching records" : `No ${label.toLowerCase()} records yet`} description={hasFilters ? "Try a different search or clear the filters." : "Create the first one to get started."} action={!hasFilters ? newButton : undefined} /></div>
        ) : (
          <>
          {isProduct ? (
            <ProductTable
              items={items}
              categoryNames={lookupsBySchema.Category}
              brandNames={lookupsBySchema.Brand}
              placeholders={placeholders}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ) : (
            <ResourceTable meta={meta} items={items} onEdit={setEditing} onDelete={setDeleting} referenceLabels={referenceLabels} />
          )}
          <div className="flex flex-col gap-3 border-t border-hairline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted">
              Showing {(pageNo - 1) * PAGE_SIZE + 1} to {Math.min(pageNo * PAGE_SIZE, totalCount)} of {totalCount} entries
            </span>
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
      </section>

      {(creating || editing) && (
        <Drawer
          onClose={closeModals}
          title={editing ? `Edit ${label}` : `New ${label}`}
          description={editing ? `Update this ${label.toLowerCase()}'s details.` : `Add a new ${label.toLowerCase()} to the catalog.`}
        >
          <ResourceForm
            meta={meta}
            record={editing}
            submitting={mutations.create.isPending || mutations.update.isPending}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={closeModals}
          />
        </Drawer>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete this ${label.toLowerCase()}?`}
          description="This action can't be undone."
          confirmLabel="Delete"
          danger
          loading={mutations.remove.isPending}
          onConfirm={handleDelete}
          onCancel={closeModals}
        />
      )}
    </div>
  );
}
