"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { HeroSlide } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import { useLeadModal } from "./providers/LeadModalProvider";

type HeroSectionProps = {
  slides: HeroSlide[];
  clubName: string;
  tagline?: string;
  description?: string;
};

const AUTO_SWITCH = 6000;

export default function HeroSection({ slides, clubName, tagline, description }: HeroSectionProps) {
  const [index, setIndex] = useState(0);
  const { openLeadModal } = useLeadModal();

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SWITCH);
    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[index];

  return (
    <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-gabi-blue via-sky-500 to-indigo-500 text-white shadow-glow">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" aria-hidden />
      <div className="relative grid gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-12 lg:px-16 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="badge w-fit bg-white/20 text-white">{clubName}</span>
          <h1 className="font-display text-4xl uppercase tracking-[0.18em] md:text-6xl">{tagline ?? "Спорт. Приключения. Команда."}</h1>
          <p className="max-w-xl text-base text-white/80 md:text-lg">
            {description ??
              "Календарь тренировок, авторские кэмпы и блог для тех, кто живёт движением. Присоединяйся к Gabi Club."}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              className="btn-primary"
              onClick={() => openLeadModal({ source: "hero" })}
              type="button"
            >
              Записаться на тренировку
            </button>
            <button
              className="btn-secondary"
              onClick={() => openLeadModal({ source: "hero-call" })}
              type="button"
            >
              Позвоните мне
            </button>
          </div>
          <div className="flex items-center gap-3 pt-6 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-300" aria-hidden />
              Расписание обновляется ежедневно
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <span className="h-3 w-3 rounded-full bg-white/70" aria-hidden />
              200+ участников клуба
            </div>
          </div>
        </div>

        <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-white/10 shadow-inner">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeSlide?.id ?? index}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {activeSlide?.image ? (
                <Image
                  src={resolveMediaUrl(activeSlide.image) ?? activeSlide.image}
                  alt={activeSlide.title ?? "Gabi Club"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10 text-2xl font-semibold text-white/70">
                  {clubName}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-sm">
                <div className="font-semibold uppercase tracking-[0.2em] text-white/80">#{index + 1}</div>
                {activeSlide?.title && <div className="text-lg font-semibold text-white">{activeSlide.title}</div>}
                {activeSlide?.subtitle && <div className="text-white/80">{activeSlide.subtitle}</div>}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-6 left-6 flex gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id ?? idx}
                onClick={() => setIndex(idx)}
                className={clsx(
                  "h-2.5 w-6 rounded-full transition",
                  idx === index ? "bg-white" : "bg-white/40 hover:bg-white/70",
                )}
                aria-label={`Слайд ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
