"use client";

import Image from "next/image";
import { useState } from "react";

export function MachineGallery({ images, title, brand }: { images: string[]; title: string; brand: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-m border border-line bg-bg-2 p-8 text-center">
        <span className="font-display text-[34px] font-bold uppercase tracking-[.06em] text-text-0">{brand}</span>
        <span className="font-mono text-[12px] text-text-2">Photos shared on request</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-m border border-line bg-bg-2">
        <Image
          src={images[active]}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          sizes="(min-width: 901px) 50vw, 100vw"
          className="object-contain"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`relative aspect-square overflow-hidden rounded-s border bg-bg-2 ${
                i === active ? "border-yellow" : "border-line hover:border-line-strong"
              }`}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
