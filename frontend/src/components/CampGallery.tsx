"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveMediaUrl } from "@/lib/api";
import { FiX } from "react-icons/fi";
import DebugImage from "./DebugImage";

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
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Track viewport to disable drag on desktop completely
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
            <DebugImage
              debugName={`camp-gallery-thumb:${slug}:${photo.id}`}
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
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[gallery] close click');
              close();
            }}
            aria-label="Закрыть"
            type="button"
          >
            <FiX size={22} />
          </button>
          <button className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); console.log('[gallery] prev click'); prev(); }} aria-label="Предыдущее" type="button">
            ‹
          </button>
          <button className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); console.log('[gallery] next click'); next(); }} aria-label="Следующее" type="button">
            ›
          </button>
          <div
            className="relative z-0 h-[80vh] w-[90vw] max-w-5xl cursor-grab md:cursor-auto active:cursor-grabbing md:active:cursor-auto"
            ref={frameRef}
            onClick={(e) => {
              // Only close overlay clicks should bubble; keep image clicks local
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              if (isDesktop) { console.log('[gallery] pointerDown ignored on desktop'); return; } // disable drag on desktop
              // Ignore pointer starts on controls to avoid hijacking their clicks
              const t = e.target as HTMLElement;
              if (t.closest('button')) return;
              setDragStartX(e.clientX);
              setAnimating(false);
              try { (e.currentTarget as any).setPointerCapture(e.pointerId); } catch {}
            }}
            onPointerMove={(e) => {
              if (isDesktop) return;
              if (dragStartX == null) return;
              setDragX(e.clientX - dragStartX);
            }}
            onPointerUp={(e) => {
              if (isDesktop) return;
              if (dragStartX == null) return;
              const delta = dragX;
              setDragStartX(null);
              const threshold = 60;
              const width = frameRef.current?.clientWidth ?? 0;
              if (Math.abs(delta) > threshold) {
                // Animate slide out then switch index and snap back without transition
                const target = delta < 0 ? -width : width;
                setAnimating(true);
                setDragX(target);
                setTimeout(() => {
                  if (delta < 0) next(); else prev();
                  setAnimating(false);
                  setDragX(0);
                }, 220);
              } else {
                // Return to center
                setAnimating(true);
                setDragX(0);
                setTimeout(() => setAnimating(false), 200);
              }
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
                    <DebugImage
                      debugName={`camp-gallery-current:${slug}:${curr.id}`}
                      src={curr.src}
                      alt={curr.caption || title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* Next (to the right) */}
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{ ...common, left: "100%", transform: `translateX(${dragX}px)` }}
                  >
                    <DebugImage
                      debugName={`camp-gallery-next:${slug}:${items[nextIdxCalc].id}`}
                      src={items[nextIdxCalc].src}
                      alt=""
                      fill
                      className="object-contain"
                      aria-hidden
                    />
                  </div>
                  {/* Prev (to the left) */}
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{ ...common, left: "-100%", transform: `translateX(${dragX}px)` }}
                  >
                    <DebugImage
                      debugName={`camp-gallery-prev:${slug}:${items[prevIdxCalc].id}`}
                      src={items[prevIdxCalc].src}
                      alt=""
                      fill
                      className="object-contain"
                      aria-hidden
                    />
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
