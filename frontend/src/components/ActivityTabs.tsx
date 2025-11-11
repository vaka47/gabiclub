"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useLeadModal } from "./providers/LeadModalProvider";

type ActivityKey = "ski" | "rollers" | "run" | "functional";

type Activity = {
  key: ActivityKey;
  title: string;
  lines: string[];
  shortTitle?: string; // used on mobile
};

const ACTIVITIES: Activity[] = [
  {
    key: "ski",
    title: "Лыжи",
    lines: [
      "Техника классического и конькового хода",
      "Подготовка к сезонам и стартам",
      "Анализ видео и индивидуальные правки",
    ],
  },
  {
    key: "rollers",
    title: "Лыжероллеры",
    lines: [
      "Безопасная база летом",
      "Силовая выносливость и баланс",
      "Подбор инвентаря и трасс",
    ],
  },
  {
    key: "run",
    title: "Бег",
    lines: [
      "Постановка техники и каданса",
      "Трейл/шоссе — под вашу цель",
      "Силовая подготовка бегуна",
    ],
  },
  {
    key: "functional",
    title: "Функциональный треннинг",
    shortTitle: "ОФП",
    lines: [
      "Силовые комплексы и ОФП",
      "Стабилизация корпуса и мобильность",
      "Работа с пульсом и прогрессией",
    ],
  },
];

export default function ActivityTabs() {
  const [active, setActive] = useState<ActivityKey | null>(null);
  const { openLeadModal } = useLeadModal();

  const activeActivity = useMemo(
    () => ACTIVITIES.find((a) => a.key === active) ?? null,
    [active],
  );

  const scrollToSchedule = () => {
    const el = document.getElementById("schedule");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.section
      className="mt-10 space-y-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex flex-wrap justify-center gap-3">
        {ACTIVITIES.map((a) => (
          <button
            key={a.key}
            type="button"
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              active === a.key
                ? "bg-gabi-blue text-white shadow-glow"
                : "bg-white text-slate-600 shadow-sm hover:bg-slate-100",
            )}
            onClick={() => setActive((prev) => (prev === a.key ? null : a.key))}
          >
            {a.shortTitle ? (
              <>
                <span className="md:hidden">{a.shortTitle}</span>
                <span className="hidden md:inline">{a.title}</span>
              </>
            ) : (
              a.title
            )}
          </button>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {activeActivity && (
          <motion.div
            key={activeActivity.key}
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="card-surface mt-1 space-y-3">
              <ul className="space-y-2 text-sm text-slate-600">
                {activeActivity.lines.map((l, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gabi-blue/80" aria-hidden />
                    {l}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() =>
                    openLeadModal({
                      source: `activity-${activeActivity.key}`,
                      preferred_direction: activeActivity.title,
                      message: `Хочу начать: ${activeActivity.title}`,
                    })
                  }
                >
                  Записаться
                </button>
                <button className="btn-secondary" type="button" onClick={scrollToSchedule}>
                  Перейти к расписанию
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
