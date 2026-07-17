import { revalidatePath } from "next/cache";

/**
 * Every admin mutation that touches a product, its batches, or its media
 * must call this — not just revalidate the admin routes. Found the hard
 * way: none of the product/batch/media actions revalidated the *public*
 * product page, so a real deployed server would keep serving stale data
 * after an edit until the next full rebuild. `'page'` mode revalidates
 * every page matching the dynamic segment pattern in one call, so callers
 * don't need to know the specific brand/sku to invalidate the right one.
 */
export function revalidatePublicProductPaths() {
  revalidatePath("/", "page");
  revalidatePath("/products", "page");
  revalidatePath("/brands", "page");
  revalidatePath("/brands/[brand]", "page");
  revalidatePath("/parts/[brand]/[sku]", "page");
}
