"use client";

import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { HeroSlide } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";

type PromoItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
};

type HeroSectionProps = {
  slides: HeroSlide[];
  clubName: string;
  tagline?: string;
  description?: string;
  promos?: PromoItem[];
};

const AUTO_SWITCH = 6000;

export default function HeroSection({ slides, clubName, tagline, description, promos = [] }: HeroSectionProps) {
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

      <div className="relative z-20 px-6 py-12 md:px-12 lg:px-16 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] items-start">
          {/* Left column: heading and CTA */}
          <div className="max-w-3xl">
          <div className="space-y-3">
            <span className="badge w-fit">{clubName}</span>
            <h1 className="font-display text-4xl uppercase tracking-[0.18em] leading-[1.05] md:text-6xl text-gabi-blue">
              {(() => {
                const text = (tagline ?? "КЛУБ ДЛЯ ТЕХ, КТО ВЫБИРАЕТ ПРИКЛЮЧЕНИЯ").toUpperCase();
                const m = text.match(/^(.*?,\s*)(КТО\b\s*)(.*)$/i);
                if (m) {
                  // try to split the rest so last word goes to third line
                  const rest = m[3];
                  const m2 = rest.match(/^(.*?\b)(ПРИКЛЮЧЕНИЯ.*)$/i);
                  if (m2) {
                    return (
                      <>
                        {m[1]}
                        <br />
                        {m[2]}
                        {m2[1]}
                        <br />
                        {m2[2]}
                      </>
                    );
                  }
                  return (
                    <>
                      {m[1]}
                      <br />
                      {m[2]}
                      {m[3]}
                    </>
                  );
                }
                return text;
              })()}
            </h1>
            <p className="max-w-2xl text-base text-slate-700 md:text-lg">
              {description ??
                "Тренируйся системно. Развивайся с GABI — лыжи, роллеры, бег с вниманием к деталям и технике."}
            </p>
          </div>

          {/* CTA Card — compact, left aligned */}
          <div className="mt-8 w-full max-w-sm gradient-card">
            <div className="relative z-10 p-6 md:p-7">
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-semibold text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]">
                  Готовы начать?
                </h3>
                <LeadCtaButton label="Записаться" className="btn-primary w-fit" source="hero-cta" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-white/90">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-emerald-300" aria-hidden />
              Расписание обновляется ежедневно
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <span className="h-3 w-3 rounded-full bg-white/70" aria-hidden />
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
                    idx === bgIndex ? "bg-white" : "bg-white/40 hover:bg-white/70",
                  )}
                  aria-label={`Слайд ${idx + 1}`}
                  type="button"
                />
              ))}
            </div>
          )}
        </div>
        {/* Right column: vertical promo slider */}
        <div className="hidden md:block">
          {promos.length > 0 && (
            <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur shadow-glow">
              <AnimatePresence mode="popLayout">
                {promos.map((p, i) =>
                  i === (bgIndex % promos.length) ? (
                    <motion.a
                      key={String(p.id)}
                      href={p.href}
                      className="absolute inset-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      {p.image && (
                        <Image src={p.image} alt={p.title} fill className="object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/80">Анонс</div>
                        <div className="text-lg font-semibold text-white">{p.title}</div>
                        {p.subtitle && <div className="text-white/80">{p.subtitle}</div>}
                      </div>
                    </motion.a>
                  ) : null,
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
