"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { TrainingDirection } from "@/lib/types";

const TAB_CYCLE_STEP_MS = 2000;
const TAB_CYCLE_MIN_DURATION_MS = 6600;

type TabButtonStyle = CSSProperties & {
  "--tab-base-bg": string;
  "--tab-base-fg": string;
  "--tab-base-shadow": string;
  "--tab-cycle-delay": string;
  "--tab-cycle-duration": string;
};

type ActivityTabsProps = {
  directions: TrainingDirection[];
};

export default function ActivityTabs({ directions }: ActivityTabsProps) {
  const items = useMemo(
    () =>
      (Array.isArray(directions) ? directions : []).filter(
        (direction): direction is TrainingDirection =>
          Boolean(direction?.id) && Boolean(direction?.title) && Boolean(direction?.slug),
      ),
    [directions],
  );
  const cycleDurationMs = useMemo(
    () => Math.max(items.length * TAB_CYCLE_STEP_MS, TAB_CYCLE_MIN_DURATION_MS),
    [items.length],
  );
  const cycleDelayStepMs = useMemo(
    () => (items.length ? Math.round(cycleDurationMs / items.length) : 0),
    [cycleDurationMs, items.length],
  );
  const rows = useMemo(() => {
    const indexedItems = items.map((direction, index) => ({ direction, index }));

    if (indexedItems.length <= 3) {
      return [indexedItems];
    }
    if (indexedItems.length === 4) {
      return [indexedItems.slice(0, 2), indexedItems.slice(2, 4)];
    }
    if (indexedItems.length === 5) {
      return [indexedItems.slice(0, 3), indexedItems.slice(3, 5)];
    }

    const groupedRows: Array<typeof indexedItems> = [];
    for (let start = 0; start < indexedItems.length; start += 3) {
      groupedRows.push(indexedItems.slice(start, start + 3));
    }
    return groupedRows;
  }, [items]);

  const getMobileTitle = (title: string) => {
    const normalizedTitle = title.trim().toLowerCase();
    if (normalizedTitle === "функциональный треннинг" || normalizedTitle === "функциональный тренинг") {
      return "ОФП";
    }
    return title;
  };

  const getTabButtonStyle = (index: number): TabButtonStyle => ({
    "--tab-base-bg": "#ffffff",
    "--tab-base-fg": "var(--hero-tagline-color)",
    "--tab-base-shadow": "0 1px 2px rgba(15, 23, 42, 0.08)",
    "--tab-cycle-delay": `${index * cycleDelayStepMs}ms`,
    "--tab-cycle-duration": `${cycleDurationMs}ms`,
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="activity-tabs mt-10 space-y-4"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="space-y-7 md:space-y-8">
        {rows.map((row, rowIndex) => (
          <div
            key={`directions-row-${rowIndex}`}
            className="grid w-full gap-2"
            style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}
          >
            {row.map(({ direction, index }) => (
              <motion.div key={direction.id} className="min-w-0">
                <Link
                  href={`/trainings/${encodeURIComponent(direction.slug ?? String(direction.id))}`}
                  className={clsx(
                    "tab-btn flex w-full items-center justify-center rounded-full font-semibold transition transform-gpu",
                    "bg-white shadow-sm",
                    "activity-tab-cycle",
                  )}
                  style={getTabButtonStyle(index)}
                >
                  <span className="tab-btn-label">
                    <span className="md:hidden">{getMobileTitle(direction.title)}</span>
                    <span className="hidden md:inline">{direction.title}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
