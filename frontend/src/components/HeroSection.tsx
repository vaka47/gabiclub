"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { HeroSlide } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";

type HeroSectionProps = {
  slides: HeroSlide[];
  clubName: string;
  tagline?: string;
  description?: string;
  formPhoto?: string;
};

const AUTO_SWITCH = 6000;

export default function HeroSection({ slides, clubName, tagline, description }: HeroSectionProps) {
  // Background slideshow: takes two images from env, falls back to club slides
  const envSlides = useMemo(
    () =>
      [process.env.NEXT_PUBLIC_HERO_BG_1, process.env.NEXT_PUBLIC_HERO_BG_2]
        .filter(Boolean)
        .map((s) => resolveMediaUrl(String(s))) as string[],
    [],
  );

  const bgSlides = useMemo(() => {
    const fromClub = slides
      .map((s) => resolveMediaUrl(s.image) ?? s.image)
      .filter(Boolean) as string[];
    return envSlides.length > 0 ? envSlides : fromClub;
  }, [slides, envSlides]);

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (bgSlides.length < 2) return;
    const timer = setInterval(() => {
      setBgIndex((p) => (p + 1) % bgSlides.length);
    }, AUTO_SWITCH);
    return () => clearInterval(timer);
  }, [bgSlides.length]);

  return (
    <section className="relative overflow-hidden rounded-[36px] text-gabi-dark shadow-glow">
      {/* Full-bleed background slideshow for the whole hero container */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <AnimatePresence mode="popLayout">
          {bgSlides.slice(0, Math.max(1, bgSlides.length)).map((_, i) =>
            i === bgIndex ? (
              <motion.div
                key={`hero-bg-${i}-${bgSlides[i]}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0, ease: "easeOut" }}
              >
                <Image src={bgSlides[i]} alt="Hero background" fill className="object-cover" priority />
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
      </div>
      {/* Haze overlay above photos, below content */}
      <div className="absolute inset-0 hero-haze" aria-hidden />

      <div className="relative z-20 px-6 py-16 md:px-12 lg:px-16 lg:py-20">
        <div className="max-w-3xl">
          <div className="space-y-3">
            <span className="badge w-fit">{clubName}</span>
            <h1 className="font-display text-4xl uppercase tracking-[0.18em] md:text-6xl text-gabi-blue">
              {tagline ?? "ЛЫЖНЫЙ КЛУБ GABI"}
            </h1>
            <p className="max-w-2xl text-base text-slate-700 md:text-lg">
              {description ??
                "Тренируйся системно. Развивайся с GABI — лыжи, роллеры, бег с вниманием к деталям и технике."}
            </p>
          </div>

          {/* CTA Card without inner slideshow; keeps subtle edge gradients only */}
          <div className="mt-8 gradient-card">
            <div className="relative z-10 p-6 md:p-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]">Готовы начать?</h3>
                  <p className="text-sm text-white/90">Оставьте заявку — администратор свяжется в рабочее время.</p>
                </div>
                <LeadCtaButton label="Записаться" className="btn-primary" source="hero-cta" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
              Расписание обновляется ежедневно
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <span className="h-3 w-3 rounded-full bg-slate-400" aria-hidden />
              200+ участников клуба
            </div>
          </div>

          {bgSlides.length > 1 && (
            <div className="mt-4 flex gap-2">
              {bgSlides.map((src, idx) => (
                <button
                  key={src + idx}
                  onClick={() => setBgIndex(idx)}
                  className={clsx(
                    "h-2.5 w-6 rounded-full transition",
                    idx === bgIndex ? "bg-slate-800" : "bg-slate-400/60 hover:bg-slate-600",
                  )}
                  aria-label={`Слайд ${idx + 1}`}
                  type="button"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
