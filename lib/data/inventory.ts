// Supabase-backed data layer — the single module every public page reads
// inventory through. Uses the anon-key client (no session/cookie
// dependency, see lib/supabase/server.ts) since every read here is public
// data gated by RLS's `status = 'published'`/`active` policies, not by who's
// signed in — this also makes these functions safe to call from
// generateStaticParams, which runs at build time with no HTTP request to
// read cookies from. Every export is async and wrapped in React's cache()
// so multiple components (Header, Footer, CategoryGrid, ...) independently
// calling the same lookup only hit the database once per request.
//
// getBrands/getEquipmentCategories/getSiteSettings/getAllPublishedProducts
// are additionally wrapped in unstable_cache — React's cache() only
// dedupes within one request, which is invisible on statically-generated
// pages (the data is fetched once at build time regardless) but does
// nothing for dynamic routes: /api/search re-fetched the entire 2,200+
// product catalog from Supabase on every single request (measured ~1s,
// every time, never faster) before this change. unstable_cache persists
// the result across requests, tagged "catalog" so it invalidates in
// lockstep with the exact same admin actions that already call
// revalidatePublicProductPaths()/revalidateTag("catalog") — freshness
// behavior for admins is unchanged, only repeat public requests get faster.

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createAnonSupabaseClient } from "@/lib/supabase/server";
import { selectAllPaginated } from "@/lib/supabase/paginate";
import { normalizePartNumber } from "@/lib/part-number";
import { getPublicMediaUrl } from "@/lib/supabase/storage";
import type { Database } from "@/lib/supabase/types";
import type { Brand, EquipmentCategory, Product, SiteSettings } from "@/lib/types";

/** Exported so lib/admin/revalidate.ts can invalidate this exact tag rather than duplicating the string. */
export const CATALOG_CACHE_TAG = "catalog";

type ProductViewRow = Database["public"]["Views"]["product_public_view"]["Row"];

function mapViewRowToProduct(row: ProductViewRow): Product {
  return {
    id: row.id,
    brandSlug: row.brand_slug,
    brandName: row.brand_name,
    equipmentCategorySlug: row.equipment_category_slug,
    equipmentCategoryName: row.equipment_category_name,
    productCategorySlug: row.product_category_slug,
    productCategoryName: row.product_category_name,
    oemPartNumber: row.oem_part_number,
    oemPartNumberNormalized: row.oem_part_number_normalized,
    description: row.description,
    // image_path is a raw Storage object path (product_media.storage_path),
    // never a full URL — resolved here so every public component just
    // renders Product.imagePath directly, same as before media existed.
    imagePath: row.image_path ? getPublicMediaUrl("product-media", row.image_path) : null,
    quantity: row.quantity,
    status: row.status,
  };
}

export const getBrands = cache(
  unstable_cache(
    async (): Promise<Brand[]> => {
      const supabase = createAnonSupabaseClient();
      const { data, error } = await supabase.from("brands").select("id, name, slug").eq("status", "active").order("name");
      if (error) throw error;
      return data;
    },
    ["public-brands"],
    { tags: [CATALOG_CACHE_TAG] },
  ),
);

export const getBrandBySlug = cache(async (slug: string): Promise<Brand | undefined> => {
  const brands = await getBrands();
  return brands.find((b) => b.slug === slug);
});

// Display-only config with no home in the DB (see supabase/seed.sql's note)
// — brand-label copy and category imagery stay in application code. Fixed
// display order too, matching the site's established category ordering
// (the 3 live categories, then the 3 sourcing ones) rather than DB order.
const CATEGORY_DISPLAY: Record<string, { brandsLabel: string; imagePath: string | null }> = {
  "truck-parts": { brandsLabel: "Iveco", imagePath: "/images/marketing/trucks.png" },
  "construction-equipment-parts": { brandsLabel: "Kobelco", imagePath: "/images/marketing/construction-equipment.png" },
  "generator-parts": { brandsLabel: "Kohler", imagePath: "/categories/generator-parts.png" },
  "mining-industrial-parts": { brandsLabel: "Multi-brand sourcing network", imagePath: "/images/marketing/mining-equipment.png" },
  "marine-parts": { brandsLabel: "Multi-brand sourcing network", imagePath: "/images/marketing/marine-engine.png" },
  "tyres-batteries-accessories": { brandsLabel: "Multi-brand sourcing network", imagePath: "/images/marketing/tyres-batteries-accessories.png" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_DISPLAY);

// "Live" vs "sourcing" is never hardcoded — it's computed from whether the
// category actually has published SKUs, so a category goes live the moment
// real inventory is imported for it, with no code change.
//
// Counts come from getAllPublishedProducts() (itself unstable_cache'd,
// tagged "catalog") grouped in memory, not from a per-category count(*)
// query — this used to be 1 query + one count(*) round trip per category
// (7 total, ~440ms). Both this function and getAllPublishedProducts share
// the same cache tag, so they invalidate together and can never disagree
// about what "currently published" means.
export const getEquipmentCategories = cache(
  unstable_cache(
    async (): Promise<EquipmentCategory[]> => {
      const supabase = createAnonSupabaseClient();
      const [{ data: categories, error }, products] = await Promise.all([
        supabase.from("equipment_categories").select("id, name, slug"),
        getAllPublishedProducts(),
      ]);
      if (error) throw error;

      const countBySlug = new Map<string, number>();
      for (const p of products) countBySlug.set(p.equipmentCategorySlug, (countBySlug.get(p.equipmentCategorySlug) ?? 0) + 1);

      const sorted = [...categories].sort((a, b) => CATEGORY_ORDER.indexOf(a.slug) - CATEGORY_ORDER.indexOf(b.slug));

      return sorted.map((c) => {
        const count = countBySlug.get(c.slug) ?? 0;
        const display = CATEGORY_DISPLAY[c.slug];
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          status: count > 0 ? "live" : "sourcing",
          brandsLabel: display?.brandsLabel ?? "Multi-brand sourcing network",
          skuCount: count,
          imagePath: display?.imagePath ?? null,
        } satisfies EquipmentCategory;
      });
    },
    ["public-equipment-categories"],
    { tags: [CATALOG_CACHE_TAG] },
  ),
);

export const getSiteSettings = cache(
  unstable_cache(
    async (): Promise<SiteSettings> => {
      const supabase = createAnonSupabaseClient();
      const { data, error } = await supabase.from("settings").select("*").single();
      if (error) throw error;
      return {
        phonePrimary: data.phone_primary,
        phoneSecondary: data.phone_secondary ?? "",
        whatsappNumber: data.whatsapp_number,
        email: data.email,
        address: data.address,
      };
    },
    ["public-site-settings"],
    { tags: [CATALOG_CACHE_TAG] },
  ),
);

export const getProductByBrandAndSku = cache(async (brandSlug: string, skuParam: string): Promise<Product | undefined> => {
  const supabase = createAnonSupabaseClient();
  const normalized = normalizePartNumber(skuParam);
  const { data, error } = await supabase
    .from("product_public_view")
    .select("*")
    .eq("brand_slug", brandSlug)
    .eq("oem_part_number_normalized", normalized)
    .maybeSingle();
  if (error) throw error;
  return data ? mapViewRowToProduct(data) : undefined;
});

export const getProductsByBrand = cache(async (brandSlug: string): Promise<Product[]> => {
  const supabase = createAnonSupabaseClient();
  const rows = await selectAllPaginated<ProductViewRow>((from, to) =>
    supabase
      .from("product_public_view")
      .select("*")
      .eq("brand_slug", brandSlug)
      .order("quantity", { ascending: false })
      .order("id", { ascending: true })
      .range(from, to),
  );
  return rows.map(mapViewRowToProduct);
});

/** Every published product, for /api/search to filter/rank in memory. */
export const getAllPublishedProducts = cache(
  unstable_cache(
    async (): Promise<Product[]> => {
      const supabase = createAnonSupabaseClient();
      const rows = await selectAllPaginated<ProductViewRow>((from, to) =>
        supabase.from("product_public_view").select("*").order("id", { ascending: true }).range(from, to),
      );
      return rows.map(mapViewRowToProduct);
    },
    ["public-all-published-products"],
    { tags: [CATALOG_CACHE_TAG] },
  ),
);

/** brand/sku pairs for generateStaticParams — one per published product. */
export async function getAllProductParams(): Promise<{ brand: string; sku: string }[]> {
  const supabase = createAnonSupabaseClient();
  const rows = await selectAllPaginated<{ brand_slug: string; oem_part_number: string }>((from, to) =>
    supabase.from("product_public_view").select("brand_slug, oem_part_number").order("id", { ascending: true }).range(from, to),
  );
  return rows.map((r) => ({ brand: r.brand_slug, sku: r.oem_part_number.toLowerCase() }));
}

/** Same equipment category, excluding the product itself, highest-stock first. */
export const getRelatedProducts = cache(async (product: Product, limit = 4): Promise<Product[]> => {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase
    .from("product_public_view")
    .select("*")
    .eq("equipment_category_slug", product.equipmentCategorySlug)
    .neq("id", product.id)
    .order("quantity", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(mapViewRowToProduct);
});

/**
 * No created_at exists in the real spreadsheets, so "Recently Added" on the
 * homepage is approximated by highest current stock depth — a real,
 * defensible signal rather than an invented recency field.
 */
export const getFeaturedProducts = cache(async (limit = 4): Promise<Product[]> => {
  const supabase = createAnonSupabaseClient();
  const { data, error } = await supabase
    .from("product_public_view")
    .select("*")
    .order("quantity", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(mapViewRowToProduct);
});

export const getBrandSkuCount = cache(async (brandSlug: string): Promise<number> => {
  const supabase = createAnonSupabaseClient();
  const { count, error } = await supabase
    .from("product_public_view")
    .select("*", { count: "exact", head: true })
    .eq("brand_slug", brandSlug);
  if (error) throw error;
  return count ?? 0;
});

export const getTotalSkuCount = cache(async (): Promise<number> => {
  const supabase = createAnonSupabaseClient();
  const { count, error } = await supabase.from("product_public_view").select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
});

/** Reuses the cached getAllPublishedProducts() list rather than a second full paginated fetch of the same rows — this used to run its own independent selectAllPaginated over product_public_view. */
export const getTotalUnitCount = cache(async (): Promise<number> => {
  const products = await getAllPublishedProducts();
  return products.reduce((sum, p) => sum + p.quantity, 0);
});

export const getLiveBrandCount = cache(async (): Promise<number> => {
  const brands = await getBrands();
  return brands.length;
});
