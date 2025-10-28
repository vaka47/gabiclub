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
    <section
      className="relative overflow-hidden rounded-[36px] text-white shadow-glow"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, var(--brand-grad-start, #1A5ACB), var(--brand-grad-end, #FF6A00))",
      }}
    >
      {/* Background slideshow under gradient overlay */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <AnimatePresence mode="popLayout">
          {bgSlides.slice(0, Math.max(1, bgSlides.length)).map((_, i) =>
            i === bgIndex ? (
              <motion.div
                key={`bg-${i}-${bgSlides[i]}`}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 0.5, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <Image src={bgSlides[i]} alt="Hero background" fill className="object-cover" priority />
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
        {/* Existing gradient texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
      </div>

      <div className="relative px-6 py-16 md:px-12 lg:px-16 lg:py-20">
        <div className="max-w-3xl">
          <div className="space-y-3">
            <span className="badge w-fit bg-white/20 text-white">{clubName}</span>
            <h1 className="font-display text-4xl uppercase tracking-[0.18em] md:text-6xl">
              {tagline ?? "ЛЫЖНЫЙ КЛУБ GABI"}
            </h1>
            <p className="max-w-2xl text-base text-white/85 md:text-lg">
              {description ??
                "Тренируйся системно. Развивайся с GABI — лыжи, роллеры, бег с вниманием к деталям и технике."}
            </p>
          </div>

          {/* CTA instead of inline form */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <LeadCtaButton label="Записаться" className="btn-primary" source="hero-cta" />
            <a href="#schedule" className="btn-secondary">
              Смотреть расписание
            </a>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-white/80">
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

        {bgSlides.length > 1 && (
          <div className="absolute bottom-6 left-6 flex gap-2">
            {bgSlides.map((src, idx) => (
              <button
                key={src + idx}
                onClick={() => setBgIndex(idx)}
                className={clsx(
                  "h-2.5 w-6 rounded-full transition",
                  idx === bgIndex ? "bg-white" : "bg-white/40 hover:bg-white/70",
                )}
                aria-label={`Слайд ${idx + 1}`}
                type="button"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
