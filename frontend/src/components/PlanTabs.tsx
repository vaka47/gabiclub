"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

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
        map.set(plan.category, plan.category_display);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [plans]);

  const [activeCategory, setActiveCategory] = useState<TrainingPlan["category"]>(
    categories[0]?.value ?? "personal",
  );

  const filteredPlans = plans.filter((plan) => plan.category === activeCategory);

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
        <p className="section-subtitle">Подберите комфортный формат: индивидуально или в группе.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
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

      <motion.div
        className="grid gap-6 md:grid-cols-2"
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
