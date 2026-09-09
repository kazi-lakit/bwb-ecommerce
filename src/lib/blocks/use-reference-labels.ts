"use client";

import { useMemo } from "react";
import { useEntityList } from "./hooks";
import { entityLabel } from "@/lib/format";
import { REFERENCE_FIELD_TARGETS } from "./reference-fields";
import type { EntityMeta } from "./schema-meta";
import type { EntityRecord } from "./collections";

/**
 * Resolves every reference field (WarehouseId, ProductId, VariantId, BrandId,
 * CategoryIds, ParentId, SupplierId, …) on the given rows to the target record's name,
 * instead of a raw ItemId. Rather than fetching an arbitrary page of the target
 * collection (which silently misses whatever doesn't happen to be in it once a
 * collection is bigger than one lookup page), this collects the *actual* ids
 * referenced by `items` and fetches exactly those via `where: {ItemId: {in: [...]}}` —
 * correct no matter how large the target collection is. A fixed set of hooks, one per
 * possible target schema, each only firing when `items` actually reference it.
 */
export function useReferenceLabels(meta: EntityMeta | undefined, items: EntityRecord[]) {
  const neededIdsByTarget = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const field of meta?.fields ?? []) {
      const target = REFERENCE_FIELD_TARGETS[field.name];
      if (!target) continue;
      const ids = map[target] ?? (map[target] = new Set<string>());
      for (const item of items) {
        const raw = item[field.name];
        if (Array.isArray(raw)) {
          for (const v of raw) if (typeof v === "string" && v) ids.add(v);
        } else if (typeof raw === "string" && raw) {
          ids.add(raw);
        }
      }
    }
    return map;
  }, [meta, items]);

  function idsFor(target: string): string[] {
    return Array.from(neededIdsByTarget[target] ?? []);
  }

  function lookupParams(target: string) {
    const ids = idsFor(target);
    return { params: { pageSize: 200, where: ids.length > 0 ? { ItemId: { in: ids } } : undefined }, enabled: ids.length > 0 };
  }

  const brandLookup = lookupParams("Brand");
  const categoryLookup = lookupParams("Category");
  const warehouseLookup = lookupParams("Warehouse");
  const productLookup = lookupParams("Product");
  const variantLookup = lookupParams("ProductVariant");
  const supplierLookup = lookupParams("Supplier");

  const brandsForLookup = useEntityList("Brand", brandLookup.params, brandLookup.enabled);
  const categoriesForLookup = useEntityList("Category", categoryLookup.params, categoryLookup.enabled);
  const warehousesForLookup = useEntityList("Warehouse", warehouseLookup.params, warehouseLookup.enabled);
  const productsForLookup = useEntityList("Product", productLookup.params, productLookup.enabled);
  const variantsForLookup = useEntityList("ProductVariant", variantLookup.params, variantLookup.enabled);
  const suppliersForLookup = useEntityList("Supplier", supplierLookup.params, supplierLookup.enabled);

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

  return { referenceLabels, lookupsBySchema };
}
