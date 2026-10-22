import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  CATALOG_CACHE_TAG,
  getProductByBrandAndSku,
  getProductsByBrand,
  getRelatedProducts,
} from "@/lib/data/inventory";
import type { Product } from "@/lib/types";

const cachedProductByBrandAndSku = unstable_cache(
  async (brandSlug: string, skuParam: string) => getProductByBrandAndSku(brandSlug, skuParam),
  ["public-product-by-brand-sku"],
  { tags: [CATALOG_CACHE_TAG] },
);

const cachedProductsByBrand = unstable_cache(
  async (brandSlug: string) => getProductsByBrand(brandSlug),
  ["public-products-by-brand"],
  { tags: [CATALOG_CACHE_TAG] },
);

const cachedRelatedProducts = unstable_cache(
  async (product: Product, limit: number) => getRelatedProducts(product, limit),
  ["public-related-products"],
  { tags: [CATALOG_CACHE_TAG] },
);

export const getCachedProductByBrandAndSku = cache(cachedProductByBrandAndSku);
export const getCachedProductsByBrand = cache(cachedProductsByBrand);
export const getCachedRelatedProducts = cache((product: Product, limit = 4) => cachedRelatedProducts(product, limit));
