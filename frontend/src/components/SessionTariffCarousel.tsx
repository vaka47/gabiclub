"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { SessionTariff } from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";

type SessionTariffCarouselProps = {
  tariffs: SessionTariff[];
};

type CategoryValue = SessionTariff["category"] | "";

type CategoryOption = {
  value: CategoryValue;
  label: string;
};

const formatPrice = (value: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  if (value <= 0) return "0 ₽";
  return `${value.toLocaleString("ru-RU")} ₽`;
};

export default function SessionTariffCarousel({ tariffs }: SessionTariffCarouselProps) {
  const { openLeadModal } = useLeadModal();

  const hasTariffs = Array.isArray(tariffs) && tariffs.length > 0;

  const categories = useMemo<CategoryOption[]>(() => {
    const map = new Map<CategoryValue, string>();
    tariffs.forEach((tariff) => {
      const value = (tariff.category as CategoryValue) ?? "";
      const label = tariff.category_display ?? "";
      if (!map.has(value)) {
        map.set(value, label);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [tariffs]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => (c.label ?? "").trim().length > 0),
    [categories],
  );
  const showTabs = visibleCategories.length > 1;

  const firstCategory =
    (visibleCategories[0]?.value ??
      categories[0]?.value ??
      (tariffs[0]?.category as CategoryValue) ??
      "") as CategoryValue;
  const [activeCategory, setActiveCategory] = useState<CategoryValue>(firstCategory);

  useEffect(() => {
    if (!categories.some((c) => c.value === activeCategory)) {
      setActiveCategory(firstCategory);
    }
  }, [activeCategory, categories, firstCategory]);

  const filteredTariffs = showTabs
    ? tariffs.filter((tariff) => {
        const label = (tariff.category_display ?? "").trim();
        if (!label) return true;
        return ((tariff.category as CategoryValue) ?? "") === activeCategory;
      })
    : tariffs;

  const [mobileIndex, setMobileIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const swipeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileIndex(0);
    setDesktopIndex(0);
  }, [activeCategory, filteredTariffs.length]);

  const showDesktopNav = filteredTariffs.length > 2;
  const desktopTariffsToRender = showDesktopNav
    ? [0, 1]
        .map((offset) => filteredTariffs[(desktopIndex + offset) % filteredTariffs.length])
        .filter((tariff): tariff is SessionTariff => Boolean(tariff))
    : filteredTariffs;

  const TariffCard = ({
    tariff,
    className,
  }: {
    tariff: SessionTariff;
    className?: string;
  }) => {
    const priceOptions = Array.isArray(tariff.prices) ? tariff.prices : [];
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
              <p className="mt-1 text-sm text-slate-500">{tariff.description}</p>
            )}
          </div>
          {priceOptions.length > 0 ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {priceOptions.map((option) => (
                <li
                  key={option.id}
                  className="flex flex-wrap items-baseline justify-between gap-2"
                >
                  <span className="text-left text-sm text-slate-600">{option.label}</span>
                  <span className="text-lg font-semibold text-gabi-blue">
                    {formatPrice(option.price)}
                  </span>
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

  if (!hasTariffs) {
    return null;
  }

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

      {showTabs && (
        <div className="flex flex-wrap gap-3">
          {visibleCategories.map((category) => (
            <button
              key={category.value || "uncategorized"}
              className={clsx(
                "rounded-full px-5 py-2 text-sm font-semibold transition",
                activeCategory === category.value
                  ? "bg-gabi-blue text-white shadow-glow"
                  : "bg-white text-slate-600 shadow-sm hover:bg-slate-100",
              )}
              onClick={() => setActiveCategory(category.value)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      <div className="md:hidden">
        {filteredTariffs.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() =>
                setMobileIndex((i) => (i - 1 + filteredTariffs.length) % filteredTariffs.length)
              }
              aria-label="Предыдущий тариф занятий"
            >
              ‹
            </button>
            <div
              className="flex-1 overflow-hidden"
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
                    if (filteredTariffs.length === 0) {
                      setAnimating(false);
                      setDragX(0);
                      return;
                    }
                    if (delta < 0)
                      setMobileIndex((i) => (i + 1) % filteredTariffs.length);
                    else
                      setMobileIndex(
                        (i) => (i - 1 + filteredTariffs.length) % filteredTariffs.length,
                      );
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
                const idx = filteredTariffs.length
                  ? mobileIndex % filteredTariffs.length
                  : 0;
                const curr = filteredTariffs[idx];
                if (!curr) return null;
                const prevIdx = (idx - 1 + filteredTariffs.length) % filteredTariffs.length;
                const nextIdx = (idx + 1) % filteredTariffs.length;

                return (
                  <div className="relative" style={{ height: "100%" }}>
                    <div className="invisible pointer-events-none">
                      <TariffCard className="mt-2" tariff={curr} />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `translateX(${dragX}px)`,
                        transition: animating ? "transform 160ms ease" : undefined,
                      }}
                    >
                      <TariffCard className="mt-2" tariff={curr} />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-full"
                      style={{
                        left: "100%",
                        transform: `translateX(${dragX}px)`,
                        transition: animating ? "transform 160ms ease" : undefined,
                      }}
                    >
                      <TariffCard className="mt-2" tariff={filteredTariffs[nextIdx]!} />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-full"
                      style={{
                        left: "-100%",
                        transform: `translateX(${dragX}px)`,
                        transition: animating ? "transform 160ms ease" : undefined,
                      }}
                    >
                      <TariffCard className="mt-2" tariff={filteredTariffs[prevIdx]!} />
                    </div>
                  </div>
                );
              })()}
            </div>
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() =>
                setMobileIndex((i) => (i + 1) % filteredTariffs.length)
              }
              aria-label="Следующий тариф занятий"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {desktopTariffsToRender.length > 0 && (
        <div className="hidden items-center gap-4 md:flex">
          {showDesktopNav && (
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() =>
                setDesktopIndex((i) => (i - 1 + filteredTariffs.length) % filteredTariffs.length)
              }
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
              onClick={() =>
                setDesktopIndex((i) => (i + 1) % filteredTariffs.length)
              }
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
