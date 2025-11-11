"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api";
import { FiX } from "react-icons/fi";

type Photo = { id: number; image: string; caption?: string };

type CampGalleryProps = {
  slug: string;
  title: string;
  photos: Photo[];
};

export default function CampGallery({ slug, title, photos }: CampGalleryProps) {
  const items = useMemo(() => photos.map((p) => ({ ...p, src: resolveMediaUrl(p.image) ?? p.image })), [photos]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);

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
        <div className="fixed left-0 right-0 bottom-0 top-[56px] md:top-[72px] z-40 flex items-center justify-center bg-black/90" onClick={close} role="dialog" aria-modal="true">
          <button
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Закрыть"
            type="button"
          >
            <FiX size={22} />
          </button>
          <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Предыдущее">
            ‹
          </button>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Следующее">
            ›
          </button>
          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              setDragStartX(e.clientX);
              setAnimating(false);
              try { (e.currentTarget as any).setPointerCapture(e.pointerId); } catch {}
            }}
            onPointerMove={(e) => {
              if (dragStartX == null) return;
              setDragX(e.clientX - dragStartX);
            }}
            onPointerUp={(e) => {
              if (dragStartX == null) return;
              const delta = dragX;
              setDragStartX(null);
              const threshold = 60;
              if (Math.abs(delta) > threshold) {
                if (delta < 0) next(); else prev();
              }
              setAnimating(true);
              setDragX(0);
              try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch {}
            }}
            style={{ touchAction: "pan-y" }}
          >
            {(() => {
              const curr = items[openIdx!];
              const prevIdxCalc = (openIdx! + items.length - 1) % items.length;
              const nextIdxCalc = (openIdx! + 1) % items.length;
              const common = {
                transition: animating ? "transform 200ms ease-out" : undefined,
              } as React.CSSProperties;
              return (
                <>
                  {/* Current */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-full"
                    style={{ ...common, transform: `translateX(${dragX}px)` }}
                  >
                    <Image src={curr.src} alt={curr.caption || title} fill className="object-contain" />
                  </div>
                  {/* Next (to the right) */}
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{ ...common, left: "100%", transform: `translateX(${dragX}px)` }}
                  >
                    <Image src={items[nextIdxCalc].src} alt="" fill className="object-contain" aria-hidden />
                  </div>
                  {/* Prev (to the left) */}
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{ ...common, left: "-100%", transform: `translateX(${dragX}px)` }}
                  >
                    <Image src={items[prevIdxCalc].src} alt="" fill className="object-contain" aria-hidden />
                  </div>
                </>
              );
            })()}
          </div>
          {items[openIdx].caption && (
            <div className="absolute bottom-6 max-w-4xl px-4 text-center text-sm text-white/80">{items[openIdx].caption}</div>
          )}
        </div>
      )}
    </div>
  );
}
