import Image from "next/image";
import type { AdminMedia } from "@/lib/admin/media";
import { deleteProductMedia, setPrimaryMedia, uploadProductMedia } from "./media-actions";

export function MediaSection({ productId, media }: { productId: string; media: AdminMedia[] }) {
  return (
    <div className="rounded-m border border-line bg-bg-1 p-6">
      <h3 className="text-[16px]">Media</h3>

      <div className="mt-4 grid grid-cols-2 gap-3 min-[601px]:grid-cols-3">
        {media.map((m) => (
          <div key={m.id} className="flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden rounded-s border border-line bg-bg-2">
              <Image src={m.publicUrl} alt={m.altText ?? ""} fill className="object-contain p-2" />
              {m.isPrimary ? <span className="tag tag-stock absolute left-1.5 top-1.5">Primary</span> : null}
            </div>
            <div className="flex gap-1.5">
              {!m.isPrimary ? (
                <form action={setPrimaryMedia.bind(null, m.id, productId)}>
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Set Primary
                  </button>
                </form>
              ) : null}
              <form action={deleteProductMedia.bind(null, m.id, productId, m.storagePath)}>
                <button type="submit" className="btn btn-ghost btn-sm">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {media.length === 0 ? <p className="col-span-full text-sm text-text-2">No images yet.</p> : null}
      </div>

      <form
        action={uploadProductMedia.bind(null, productId)}
        encType="multipart/form-data"
        className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4"
      >
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className="text-sm text-text-1 file:mr-3 file:rounded-s file:border file:border-line-strong file:bg-bg-2 file:px-3 file:py-2 file:text-[13px] file:text-text-0"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Upload
        </button>
      </form>
    </div>
  );
}
