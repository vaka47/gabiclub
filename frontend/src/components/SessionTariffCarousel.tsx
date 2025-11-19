"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { SessionTariff } from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";

type SessionTariffCarouselProps = {
  tariffs: SessionTariff[];
};

const formatPrice = (value: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  if (value <= 0) return "0 ₽";
  return `${value.toLocaleString("ru-RU")} ₽`;
};

export default function SessionTariffCarousel({ tariffs }: SessionTariffCarouselProps) {
  const { openLeadModal } = useLeadModal();

  const items = (Array.isArray(tariffs) ? tariffs : []).filter(
    (tariff): tariff is SessionTariff => Boolean(tariff),
  );

  const [mobileIndex, setMobileIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const swipeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileIndex(0);
    setDesktopIndex(0);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const showDesktopNav = items.length > 2;
  const desktopTariffsToRender = showDesktopNav
    ? [0, 1]
        .map((offset) => items[(desktopIndex + offset) % items.length])
        .filter((tariff): tariff is SessionTariff => Boolean(tariff))
    : items;

  const TariffCard = ({
    tariff,
    className,
  }: {
    tariff: SessionTariff;
    className?: string;
  }) => {
    const priceOptions = [...(tariff.prices ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const primaryPrice = priceOptions[0];
    return (
      <div className={clsx("card-surface flex h-full flex-col justify-between", className)}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-semibold text-gabi-dark">{tariff.title}</h3>
              {tariff.is_featured && (
                <span className="badge bg-gabi-orange/15 text-gabi-orange flex-shrink-0">
                  Хит
                </span>
              )}
            </div>
            {tariff.description && (
              <p className="mt-2 text-sm text-slate-500">{tariff.description}</p>
            )}
          </div>
          {primaryPrice && (
            <div className="flex items-baseline gap-2">
              <span className="text-sm uppercase tracking-wide text-slate-400">от</span>
              <span className="text-3xl font-semibold text-gabi-blue">
                {formatPrice(primaryPrice.price)}
              </span>
            </div>
          )}
          {priceOptions.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {priceOptions.map((option) => (
                <li key={option.id} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gabi-blue/80" aria-hidden />
                  <span className="flex-1">{option.label}</span>
                  <span className="font-semibold text-gabi-blue">{formatPrice(option.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Стоимость по запросу.</p>
          )}
        </div>
        <button
          className="btn-primary mt-6 w-full"
          onClick={() =>
            openLeadModal({
              source: "session-tariff",
              preferred_direction: tariff.title,
              message: `Интересует тариф занятий "${tariff.title}"`,
            })
          }
          type="button"
        >
          Записаться
        </button>
      </div>
    );
  };

  return (
    <motion.section
      className="mt-14 space-y-8"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-2">
        <h2 className="section-title section-accent">Тарифы занятий</h2>
        <p className="section-subtitle">
          Индивидуальные, групповые форматы и абонементы в одном блоке.
        </p>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            className="btn-secondary btn-compact"
            type="button"
            onClick={() => setMobileIndex((i) => (i - 1 + items.length) % items.length)}
            aria-label="Предыдущий тариф занятий"
          >
            ‹
          </button>
          <div
            className="flex-1 overflow-hidden rounded-[32px]"
            onPointerDown={(e) => {
              const t = e.target as HTMLElement;
              if (t.closest("button, a")) return;
              setDragStartX(e.clientX);
              setAnimating(false);
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {}
            }}
            onPointerMove={(e) => {
              if (dragStartX == null) return;
              setDragX(e.clientX - dragStartX);
            }}
            onPointerUp={(e) => {
              if (dragStartX == null) return;
              const delta = dragX;
              setDragStartX(null);
              const threshold = 50;
              const width = swipeRef.current?.clientWidth ?? 0;
              if (Math.abs(delta) > threshold) {
                setAnimating(true);
                const target = delta < 0 ? -width : width;
                setDragX(target);
                setTimeout(() => {
                  if (delta < 0) setMobileIndex((i) => (i + 1) % items.length);
                  else setMobileIndex((i) => (i - 1 + items.length) % items.length);
                  setAnimating(false);
                  setDragX(0);
                }, 200);
              } else {
                setAnimating(true);
                setDragX(0);
                setTimeout(() => setAnimating(false), 160);
              }
              try {
                e.currentTarget.releasePointerCapture(e.pointerId);
              } catch {}
            }}
            style={{ touchAction: "pan-y" }}
            ref={swipeRef}
          >
            {(() => {
              const idx = mobileIndex % items.length;
              const curr = items[idx]!;
              const prevIdx = (idx - 1 + items.length) % items.length;
              const nextIdx = (idx + 1) % items.length;

              return (
                <div className="relative" style={{ height: "100%" }}>
                  <div className="invisible pointer-events-none">
                    <TariffCard className="my-2" tariff={curr} />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: `translateX(${dragX}px)`,
                      transition: animating ? "transform 160ms ease" : undefined,
                    }}
                  >
                    <TariffCard className="my-2" tariff={curr} />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{
                      left: "100%",
                      transform: `translateX(${dragX}px)`,
                      transition: animating ? "transform 160ms ease" : undefined,
                    }}
                  >
                    <TariffCard className="my-2" tariff={items[nextIdx]!} />
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-full"
                    style={{
                      left: "-100%",
                      transform: `translateX(${dragX}px)`,
                      transition: animating ? "transform 160ms ease" : undefined,
                    }}
                  >
                    <TariffCard className="my-2" tariff={items[prevIdx]!} />
                  </div>
                </div>
              );
            })()}
          </div>
          <button
            className="btn-secondary btn-compact"
            type="button"
            onClick={() => setMobileIndex((i) => (i + 1) % items.length)}
            aria-label="Следующий тариф занятий"
          >
            ›
          </button>
        </div>
      </div>

      {desktopTariffsToRender.length > 0 && (
        <div className="hidden items-center gap-4 md:flex">
          {showDesktopNav && (
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() => setDesktopIndex((i) => (i - 1 + items.length) % items.length)}
              aria-label="Предыдущий тариф занятий"
            >
              ‹
            </button>
          )}
          <div
            className={clsx(
              "grid flex-1 gap-6",
              desktopTariffsToRender.length === 1 ? "grid-cols-1" : "grid-cols-2",
            )}
          >
            {desktopTariffsToRender.map((tariff, idx) => (
              <div key={`${tariff.id}-${idx}`} className="flex h-full flex-col justify-between">
                <TariffCard tariff={tariff} />
              </div>
            ))}
          </div>
          {showDesktopNav && (
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() => setDesktopIndex((i) => (i + 1) % items.length)}
              aria-label="Следующий тариф занятий"
            >
              ›
            </button>
          )}
        </div>
      )}
    </motion.section>
  );
}
