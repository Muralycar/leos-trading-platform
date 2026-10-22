import { revalidatePath, revalidateTag } from "next/cache";
import { CATALOG_CACHE_TAG } from "@/lib/data/inventory";
import { MACHINERY_CACHE_TAG } from "@/lib/machinery";

/**
 * Every admin mutation that touches a product, its batches, or its media
 * must call this — not just revalidate the admin routes. Found the hard
 * way: none of the product/batch/media actions revalidated the *public*
 * product page, so a real deployed server would keep serving stale data
 * after an edit until the next full rebuild. `'page'` mode revalidates
 * every page matching the dynamic segment pattern in one call, so callers
 * don't need to know the specific brand/sku to invalidate the right one.
 *
 * Also invalidates the "catalog" unstable_cache tag (lib/data/inventory.ts)
 * so cached brand/product/detail reads refresh immediately after admin changes.
 */
export function revalidatePublicProductPaths() {
  revalidatePath("/", "page");
  revalidatePath("/products", "page");
  revalidatePath("/brands", "page");
  revalidatePath("/brands/[brand]", "page");
  revalidatePath("/parts/[brand]/[sku]", "page");
  revalidateTag(CATALOG_CACHE_TAG);
}

/** Machinery equivalent: refresh cached public machinery reads and pages after any admin change. */
export function revalidatePublicMachinePaths() {
  revalidatePath("/", "page");
  revalidatePath("/machinery", "page");
  revalidatePath("/machinery/[slug]", "page");
  revalidateTag(MACHINERY_CACHE_TAG);
}
