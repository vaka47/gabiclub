"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api";

type Photo = { id: number; image: string; caption?: string };

type CampGalleryProps = {
  slug: string;
  title: string;
  photos: Photo[];
};

export default function CampGallery({ slug, title, photos }: CampGalleryProps) {
  const items = useMemo(() => photos.map((p) => ({ ...p, src: resolveMediaUrl(p.image) ?? p.image })), [photos]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const prev = useCallback(() => setOpenIdx((i) => (i == null ? i : (i + items.length - 1) % items.length)), [items.length]);
  const next = useCallback(() => setOpenIdx((i) => (i == null ? i : (i + 1) % items.length)), [items.length]);

  useEffect(() => {
    if (openIdx == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, close, prev, next]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            className="group overflow-hidden rounded-3xl focus:outline-none"
            onClick={() => setOpenIdx(idx)}
          >
            <Image
              src={photo.src}
              alt={photo.caption || title}
              width={640}
              height={420}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {openIdx != null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={close} role="dialog" aria-modal="true">
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Закрыть">
            ✕
          </button>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Предыдущее">
            ‹
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Следующее">
            ›
          </button>
          <div className="relative h-[80vh] w-[90vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={items[openIdx].src} alt={items[openIdx].caption || title} fill className="object-contain" />
          </div>
          {items[openIdx].caption && (
            <div className="absolute bottom-6 max-w-4xl px-4 text-center text-sm text-white/80">{items[openIdx].caption}</div>
          )}
        </div>
      )}
    </div>
  );
}
