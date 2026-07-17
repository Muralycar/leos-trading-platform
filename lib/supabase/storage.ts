/**
 * product_media.storage_path / product_public_view.image_path store the raw
 * object path within a bucket (e.g. "products/<id>/photo.jpg"), never a
 * full URL — keeps the DB environment-agnostic. Public URL construction
 * happens here, in application code, reading NEXT_PUBLIC_SUPABASE_URL.
 */
export function getPublicMediaUrl(bucket: string, storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${storagePath}`;
}
