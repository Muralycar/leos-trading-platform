"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addMachineImages, makeMainMachineImage, removeMachineImage } from "./actions";

const BUCKET = "machine-images";
const MAX_EDGE = 1920;

/** Downscale to web size in the browser (phone photos are 4–8 MB); falls back to the original on any failure. */
async function toWebImage(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (blob) return { blob, ext: "webp", type: "image/webp" };
  } catch {
    // fall through to the original file
  }
  return { blob: file, ext: file.name.split(".").pop() || "jpg", type: file.type || "image/jpeg" };
}

interface Props {
  machineId: string;
  images: { path: string; url: string }[];
}

export function MachineImages({ machineId, images }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpload() {
    const files = Array.from(inputRef.current?.files ?? []).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setMessage("Choose one or more photos first.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setMessage(`Uploading ${i + 1} of ${files.length}…`);
        const { blob, ext, type } = await toWebImage(files[i]);
        const path = `machines/${machineId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type, upsert: false });
        if (error) throw error;
        uploaded.push(path);
      }
      await addMachineImages(machineId, uploaded);
      if (inputRef.current) inputRef.current.value = "";
      setMessage(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded.`);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-m border border-line bg-bg-1 p-6">
      <h3 className="text-[16px]">Photos</h3>
      <p className="mt-1 text-[13px] text-text-2">The first photo is the main image. Photos are resized automatically.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <div key={img.path} className="flex flex-col gap-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-s border border-line bg-bg-2">
              <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              {i === 0 ? <span className="tag tag-stock absolute left-1.5 top-1.5">Main</span> : null}
            </div>
            <div className="flex gap-1.5">
              {i > 0 ? (
                <form action={makeMainMachineImage.bind(null, machineId, img.path)}>
                  <button type="submit" className="btn btn-ghost btn-sm">
                    Make main
                  </button>
                </form>
              ) : null}
              <form action={removeMachineImage.bind(null, machineId, img.path)}>
                <button type="submit" className="btn btn-ghost btn-sm">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
        {images.length === 0 ? <p className="col-span-full text-sm text-text-2">No photos yet.</p> : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="text-sm text-text-1 file:mr-3 file:rounded-s file:border file:border-line-strong file:bg-bg-2 file:px-3 file:py-2 file:text-[13px] file:text-text-0"
        />
        <button type="button" onClick={handleUpload} disabled={busy} className="btn btn-primary btn-sm w-fit disabled:opacity-60">
          {busy ? "Uploading…" : "Upload photos"}
        </button>
        {message ? <p className="text-[13px] text-text-1">{message}</p> : null}
      </div>
    </div>
  );
}
