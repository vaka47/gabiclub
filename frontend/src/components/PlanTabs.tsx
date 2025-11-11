"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import type { TrainingPlan } from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";

type PlanTabsProps = {
  plans: TrainingPlan[];
};

type CategoryOption = {
  value: TrainingPlan["category"];
  label: string;
};

export default function PlanTabs({ plans }: PlanTabsProps) {
  const { openLeadModal } = useLeadModal();

  const categories = useMemo<CategoryOption[]>(() => {
    const map = new Map<TrainingPlan["category"], string>();
    plans.forEach((plan) => {
      if (!map.has(plan.category)) {
        map.set(plan.category, plan.category_display ?? "");
      }
    });
    // Keep all categories in state, but render only those with labels later
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [plans]);

  const visibleCategories = useMemo(
    () => categories.filter((c) => (c.label ?? "").trim().length > 0),
    [categories],
  );
  const showTabs = visibleCategories.length > 1;

  const [activeCategory, setActiveCategory] = useState<TrainingPlan["category"]>(
    (visibleCategories[0]?.value as TrainingPlan["category"]) ?? (categories[0]?.value as TrainingPlan["category"]) ?? "personal",
  );

  const filteredPlans = showTabs
    ? plans.filter((plan) => {
        const label = (plan as any).category_display?.trim?.() ?? "";
        // Plans без категории показываем всегда, чтобы они не терялись при выборе вкладок
        if (!label) return true;
        return plan.category === activeCategory;
      })
    : plans;

  // Mobile carousel index + swipe state
  const [mobileIndex, setMobileIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  const swipeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setMobileIndex(0);
  }, [activeCategory]);

  return (
    <motion.section
      className="mt-14 space-y-8"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-2">
        <h2 className="section-title section-accent">Тренировочные планы</h2>
        <p className="section-subtitle">Подберите комфортный формат наших взаимодействий.</p>
      </div>
      {showTabs && (
      <div className="flex flex-wrap gap-3">
        {visibleCategories.map((category) => (
          <button
            key={category.value}
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

      {/* Mobile: single-card carousel */}
      <div className="md:hidden">
        {filteredPlans.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() => setMobileIndex((i) => (i - 1 + filteredPlans.length) % filteredPlans.length)}
              aria-label="Предыдущий тариф"
            >
              ‹
            </button>
            <div
              className="flex-1 overflow-hidden"
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
                const threshold = 50;
                const width = swipeRef.current?.clientWidth ?? 0;
                if (Math.abs(delta) > threshold) {
                  // animate slide out then snap to next index smoothly
                  setAnimating(true);
                  const target = delta < 0 ? -width : width;
                  setDragX(target);
                  setTimeout(() => {
                    if (delta < 0) setMobileIndex((i) => (i + 1) % filteredPlans.length);
                    else setMobileIndex((i) => (i - 1 + filteredPlans.length) % filteredPlans.length);
                    setAnimating(false);
                    setDragX(0);
                  }, 200);
                } else {
                  setAnimating(true);
                  setDragX(0);
                  setTimeout(() => setAnimating(false), 160);
                }
                try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch {}
              }}
              style={{ touchAction: "pan-y" }}
              ref={swipeRef}
            >
              {(() => {
                const idx = mobileIndex % filteredPlans.length;
                const curr = filteredPlans[idx]!;
                const prevIdx = (idx - 1 + filteredPlans.length) % filteredPlans.length;
                const nextIdx = (idx + 1) % filteredPlans.length;

                const Card = ({ plan }: { plan: TrainingPlan }) => (
                  <div className="card-surface mt-2 flex h-full flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-2xl font-semibold text-gabi-dark flex items-center gap-2">
                            {plan.icon && <span className="text-2xl" aria-hidden>{plan.icon}</span>}
                            <span>{plan.title}</span>
                          </h3>
                          {plan.is_featured && (
                            <span className="badge bg-gabi-orange/15 text-gabi-orange flex-shrink-0">Хит</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-gabi-blue">{plan.price.toLocaleString("ru-RU")}</span>
                        <span className="text-sm text-slate-500">{plan.period}</span>
                      </div>
                      <ul className="space-y-2 text-sm text-slate-600">
                        {plan.benefits.map((benefit) => (
                          <li key={benefit.id} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-gabi-blue/80" aria-hidden />
                            {benefit.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.buy_link ? (
                      <a className="btn-primary mt-6 w-full text-center" href={plan.buy_link} target="_blank" rel="noreferrer">
                        {plan.buy_label || "Приобрести"}
                      </a>
                    ) : (
                      <button
                        className="btn-primary mt-6 w-full"
                        onClick={() =>
                          openLeadModal({
                            source: "plan",
                            preferred_direction: plan.title,
                            message: `Хочу тариф \"${plan.title}\"`,
                          })
                        }
                        type="button"
                      >
                        Подробнее
                      </button>
                    )}
                  </div>
                );

                return (
                  <div className="relative" style={{ height: '100%' }}>
                    {/* Placeholder to preserve height for absolutely positioned slides */}
                    <div className="invisible pointer-events-none">
                      <Card plan={curr} />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{ transform: `translateX(${dragX}px)`, transition: animating ? 'transform 160ms ease' : undefined }}
                    >
                      <Card plan={curr} />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-full"
                      style={{ left: '100%', transform: `translateX(${dragX}px)`, transition: animating ? 'transform 160ms ease' : undefined }}
                    >
                      <Card plan={filteredPlans[nextIdx]!} />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-full"
                      style={{ left: '-100%', transform: `translateX(${dragX}px)`, transition: animating ? 'transform 160ms ease' : undefined }}
                    >
                      <Card plan={filteredPlans[prevIdx]!} />
                    </div>
                  </div>
                );
              })()}
            </div>
            <button
              className="btn-secondary btn-compact"
              type="button"
              onClick={() => setMobileIndex((i) => (i + 1) % filteredPlans.length)}
              aria-label="Следующий тариф"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* Desktop: grid of cards */}
      <motion.div
        className="hidden gap-6 md:grid md:grid-cols-2"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {filteredPlans.map((plan) => (
          <motion.div
            key={plan.id}
            className="card-surface flex h-full flex-col justify-between"
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-gabi-dark flex items-center gap-2">
                    {plan.icon && <span className="text-2xl" aria-hidden>{plan.icon}</span>}
                    <span>{plan.title}</span>
                  </h3>
                  {plan.is_featured && (
                    <span className="badge bg-gabi-orange/15 text-gabi-orange flex-shrink-0">Хит</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gabi-blue">
                  {plan.price.toLocaleString("ru-RU")}
                </span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {plan.benefits.map((benefit) => (
                  <li key={benefit.id} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gabi-blue/80" aria-hidden />
                    {benefit.text}
                  </li>
                ))}
              </ul>
            </div>
            {plan.buy_link ? (
              <a
                className="btn-primary mt-6 w-full text-center"
                href={plan.buy_link}
                target="_blank"
                rel="noreferrer"
              >
                {plan.buy_label || "Приобрести"}
              </a>
            ) : (
              <button
                className="btn-primary mt-6 w-full"
                onClick={() =>
                  openLeadModal({
                    source: "plan",
                    preferred_direction: plan.title,
                    message: `Хочу тариф \"${plan.title}\"`,
                  })
                }
                type="button"
              >
                Подробнее
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
