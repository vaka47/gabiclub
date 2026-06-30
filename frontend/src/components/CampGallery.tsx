"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlay, FiX } from "react-icons/fi";

import { resolveMediaUrl } from "@/lib/api";
import type { TariffGalleryItem } from "@/lib/types";

import DebugImage from "./DebugImage";

type GalleryItem = TariffGalleryItem & {
  kind: "image" | "video";
  src: string;
};

type CampGalleryProps = {
  slug: string;
  title: string;
  photos: TariffGalleryItem[];
  layout?: "grid" | "carousel";
};

const getMediaKind = (item: TariffGalleryItem): "image" | "video" =>
  item.type === "video" || (!item.image && item.video_file) ? "video" : "image";

const normalizeGalleryItem = (item: TariffGalleryItem): GalleryItem | null => {
  const kind = getMediaKind(item);
  const rawSrc = kind === "video" ? item.video_file : item.image;
  const src = resolveMediaUrl(rawSrc) ?? rawSrc;

  if (!src) {
    return null;
  }

  return {
    ...item,
    kind,
    src,
  };
};

function GalleryPreview({
  item,
  title,
  slug,
  className,
}: {
  item: GalleryItem;
  title: string;
  slug: string;
  className: string;
}) {
  if (item.kind === "video") {
    return (
      <>
        <video
          className={className}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={item.src} />
        </video>
        <div className="absolute inset-0 bg-slate-950/24 transition-opacity duration-300 group-hover:bg-slate-950/30" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/88 text-gabi-dark shadow-[0_18px_40px_-22px_rgba(15,23,42,0.75)]">
            <FiPlay size={24} className="translate-x-[1px]" />
          </span>
        </span>
      </>
    );
  }

  return (
    <DebugImage
      debugName={`camp-gallery-thumb:${slug}:${item.id}`}
      src={item.src}
      alt={item.caption || title}
      width={640}
      height={480}
      className={className}
    />
  );
}

function GallerySlide({
  item,
  title,
  slug,
  debugKey,
  autoPlay = false,
  showControls = false,
}: {
  item: GalleryItem;
  title: string;
  slug: string;
  debugKey: string;
  autoPlay?: boolean;
  showControls?: boolean;
}) {
  if (item.kind === "video") {
    return (
      <video
        key={debugKey}
        src={item.src}
        className="h-full w-full object-contain"
        controls={showControls}
        playsInline
        autoPlay={autoPlay}
        muted={!showControls}
        preload="metadata"
      />
    );
  }

  return (
    <DebugImage
      debugName={`camp-gallery-${debugKey}:${slug}:${item.id}`}
      src={item.src}
      alt={item.caption || title}
      fill
      className="object-contain"
    />
  );
}

export default function CampGallery({
  slug,
  title,
  photos,
  layout = "grid",
}: CampGalleryProps) {
  const items = useMemo(
    () => photos.map(normalizeGalleryItem).filter((item): item is GalleryItem => item !== null),
    [photos],
  );
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [previewStart, setPreviewStart] = useState(0);
  const previewSize = layout === "carousel" ? (isDesktop ? 3 : 1) : items.length;
  const visibleCount = Math.min(previewSize, items.length);
  const visibleItems = useMemo(() => {
    if (layout !== "carousel") {
      return items.map((item, idx) => ({ item, idx }));
    }
    if (items.length === 0) {
      return [];
    }
    return Array.from({ length: visibleCount }, (_, offset) => {
      const idx = (previewStart + offset) % items.length;
      return { item: items[idx], idx };
    });
  }, [items, layout, previewStart, visibleCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setPreviewStart(0);
  }, [items.length, layout]);

  useEffect(() => {
    if (openIdx == null) return;
    if (items.length === 0) {
      setOpenIdx(null);
      return;
    }
    if (openIdx >= items.length) {
      setOpenIdx(items.length - 1);
    }
  }, [items.length, openIdx]);

  const close = useCallback(() => setOpenIdx(null), []);
  const prev = useCallback(() => {
    if (items.length <= 1) return;
    setOpenIdx((idx) => (idx == null ? idx : (idx + items.length - 1) % items.length));
  }, [items.length]);
  const next = useCallback(() => {
    if (items.length <= 1) return;
    setOpenIdx((idx) => (idx == null ? idx : (idx + 1) % items.length));
  }, [items.length]);
  const movePreview = useCallback(
    (direction: -1 | 1) => {
      if (items.length <= 1) return;
      setPreviewStart((current) => {
        if (direction === 1) {
          return (current + 1) % items.length;
        }
        return (current + items.length - 1) % items.length;
      });
    },
    [items.length],
  );

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

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {layout === "carousel" ? (
        <div className="grid grid-cols-[auto,minmax(0,1fr),auto] items-center gap-3 md:gap-5">
          <div className="flex justify-center">
            {items.length > 1 ? (
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/92 text-gabi-dark shadow-[0_16px_40px_-24px_rgba(15,23,42,0.55)] transition hover:bg-white"
                onClick={() => movePreview(-1)}
                aria-label="Предыдущие элементы галереи"
              >
                <FiChevronLeft size={20} />
              </button>
            ) : (
              <div className="h-11 w-11" aria-hidden />
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {visibleItems.map(({ item, idx }) => (
              <button
                key={`${item.id}-${idx}`}
                type="button"
                className="group relative aspect-[11/9] overflow-hidden rounded-[26px] focus:outline-none"
                onClick={() => setOpenIdx(idx)}
              >
                <GalleryPreview
                  item={item}
                  title={title}
                  slug={slug}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                {item.kind === "image" && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            {items.length > 1 ? (
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/92 text-gabi-dark shadow-[0_16px_40px_-24px_rgba(15,23,42,0.55)] transition hover:bg-white"
                onClick={() => movePreview(1)}
                aria-label="Следующие элементы галереи"
              >
                <FiChevronRight size={20} />
              </button>
            ) : (
              <div className="h-11 w-11" aria-hidden />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {visibleItems.map(({ item, idx }) => (
            <button
              key={item.id}
              type="button"
              className="group relative overflow-hidden rounded-3xl focus:outline-none"
              onClick={() => setOpenIdx(idx)}
            >
              <GalleryPreview
                item={item}
                title={title}
                slug={slug}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      )}

      {openIdx != null && (
        <div
          className="fixed left-0 right-0 bottom-0 top-[56px] z-40 flex items-center justify-center bg-black/90 md:top-[72px]"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Закрыть"
            type="button"
          >
            <FiX size={22} />
          </button>
          <button
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Предыдущее"
            type="button"
          >
            ‹
          </button>
          <button
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Следующее"
            type="button"
          >
            ›
          </button>
          <div
            className="relative z-0 h-[80vh] w-[90vw] max-w-5xl cursor-grab active:cursor-grabbing md:cursor-auto md:active:cursor-auto"
            ref={frameRef}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onPointerDown={(e) => {
              if (isDesktop) return;
              const target = e.target as HTMLElement;
              if (target.closest("button")) return;
              setDragStartX(e.clientX);
              setAnimating(false);
              try {
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              } catch {}
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
              if (Math.abs(delta) > threshold && items.length > 1) {
                const targetX = delta < 0 ? -width : width;
                setAnimating(true);
                setDragX(targetX);
                setTimeout(() => {
                  if (delta < 0) {
                    next();
                  } else {
                    prev();
                  }
                  setAnimating(false);
                  setDragX(0);
                }, 220);
              } else {
                setAnimating(true);
                setDragX(0);
                setTimeout(() => setAnimating(false), 200);
              }
              try {
                (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
              } catch {}
            }}
            style={{ touchAction: "pan-y" }}
          >
            {(() => {
              const current = items[openIdx];
              const previousIndex = (openIdx + items.length - 1) % items.length;
              const nextIndex = (openIdx + 1) % items.length;
              const commonStyle: CSSProperties = {
                transition: animating ? "transform 200ms ease-out" : undefined,
              };

              return (
                <>
                  <div
                    className="absolute top-0 bottom-0 left-0 w-full"
                    style={{ ...commonStyle, transform: `translateX(${dragX}px)` }}
                  >
                    <GallerySlide
                      item={current}
                      title={title}
                      slug={slug}
                      debugKey="current"
                      autoPlay
                      showControls
                    />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{ ...commonStyle, left: "100%", transform: `translateX(${dragX}px)` }}
                  >
                    <GallerySlide
                      item={items[nextIndex]}
                      title={title}
                      slug={slug}
                      debugKey="next"
                    />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{ ...commonStyle, left: "-100%", transform: `translateX(${dragX}px)` }}
                  >
                    <GallerySlide
                      item={items[previousIndex]}
                      title={title}
                      slug={slug}
                      debugKey="prev"
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
