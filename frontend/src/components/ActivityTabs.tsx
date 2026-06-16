"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { TrainingDirection } from "@/lib/types";

const TAB_INTRO_START_DELAY_MS = 2600;
const TAB_INTRO_STAGGER_MS = 1880;
const TAB_INTRO_DURATION_MS = 1760;

type TabButtonStyle = CSSProperties & {
  "--tab-base-bg": string;
  "--tab-base-fg": string;
  "--tab-base-shadow": string;
};

type ActivityTabsProps = {
  directions: TrainingDirection[];
};

const shortenTitle = (title: string) => {
  const compactMap: Record<string, string> = {
    "Лыжероллеры": "Роллеры",
    "Функциональный треннинг": "ОФП",
    "Функциональный тренинг": "ОФП",
  };
  return compactMap[title] ?? title;
};

export default function ActivityTabs({ directions }: ActivityTabsProps) {
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const introStartTimerRef = useRef<number | null>(null);

  const items = useMemo(
    () =>
      (Array.isArray(directions) ? directions : []).filter(
        (direction): direction is TrainingDirection =>
          Boolean(direction?.id) && Boolean(direction?.title) && Boolean(direction?.slug),
      ),
    [directions],
  );

  useEffect(() => {
    if (!isIntroActive) return;
    const totalDuration =
      TAB_INTRO_DURATION_MS + TAB_INTRO_STAGGER_MS * Math.max(items.length - 1, 0) + 80;
    const timer = window.setTimeout(() => {
      setIsIntroActive(false);
    }, totalDuration);
    return () => window.clearTimeout(timer);
  }, [isIntroActive, items.length]);

  useEffect(() => {
    return () => {
      if (introStartTimerRef.current !== null) {
        window.clearTimeout(introStartTimerRef.current);
      }
    };
  }, []);

  const handleViewportEnter = () => {
    if (hasPlayedIntro || introStartTimerRef.current !== null) return;
    setHasPlayedIntro(true);
    introStartTimerRef.current = window.setTimeout(() => {
      setIsIntroActive(true);
      introStartTimerRef.current = null;
    }, TAB_INTRO_START_DELAY_MS);
  };

  const getTabButtonStyle = (index: number): TabButtonStyle => ({
    "--tab-base-bg": "#ffffff",
    "--tab-base-fg": "var(--hero-tagline-color)",
    "--tab-base-shadow": "0 1px 2px rgba(15, 23, 42, 0.08)",
    animationDelay: `${index * TAB_INTRO_STAGGER_MS}ms`,
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="activity-tabs mt-10 space-y-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="tabs-row flex flex-nowrap gap-2 justify-start md:justify-center">
        {items.map((direction, index) => (
          <motion.div
            key={direction.id}
            className={clsx(isIntroActive && "activity-tab-intro")}
            style={getTabButtonStyle(index)}
          >
            <Link
              href={`/trainings/${encodeURIComponent(direction.slug ?? String(direction.id))}`}
              className={clsx(
                "tab-btn rounded-full font-semibold transition transform-gpu",
                "bg-white shadow-sm hover:bg-slate-100 hover:text-gabi-blue",
              )}
            >
              <span className="tab-btn-label">
                <>
                  <span className="md:hidden">{shortenTitle(direction.title)}</span>
                  <span className="hidden md:inline">{direction.title}</span>
                </>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
