"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { HeroSlide } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";

type PromoItem = { id: string | number; title: string; subtitle?: string; image?: string; href: string };
type HeroSectionProps = { slides: HeroSlide[]; clubName: string; tagline?: string; description?: string; promos?: PromoItem[] };

const AUTO_SWITCH = 6000;

function splitHeading(rawText: string): [string, string, string] {
  const raw = rawText.toUpperCase();
  let l1 = raw;
  let l2 = "";
  let l3 = "";
  const kto = raw.match(/^(.*?),\s*(КТО\b.*)$/i);
  if (kto) {
    l1 = kto[1];
    const rest = kto[2];
    const end = rest.match(/^(.*?)(ПРИКЛЮЧЕНИЯ.*)$/i);
    if (end) {
      l2 = end[1].trim();
      l3 = end[2].trim();
    } else {
      l2 = rest.trim();
    }
  }
  return [l1, l2, l3];
}

export default function HeroSection({ slides, clubName, tagline, description, promos = [] }: HeroSectionProps) {
  const envSlides = useMemo(() => [process.env.NEXT_PUBLIC_HERO_BG_1, process.env.NEXT_PUBLIC_HERO_BG_2].filter(Boolean).map((s) => resolveMediaUrl(String(s))) as string[], []);
  const bgSlides = useMemo(() => {
    const fromClub = slides.map((s) => resolveMediaUrl(s.image) ?? s.image).filter(Boolean) as string[];
    return envSlides.length > 0 ? envSlides : fromClub;
  }, [slides, envSlides]);

  const [bgIndex, setBgIndex] = useState(0);
  useEffect(() => {
    if (bgSlides.length < 2) return;
    const timer = setInterval(() => setBgIndex((p) => (p + 1) % bgSlides.length), AUTO_SWITCH);
    return () => clearInterval(timer);
  }, [bgSlides.length]);

  const currentBg = bgSlides[bgIndex] ?? null;
  const [l1, l2, l3] = splitHeading(tagline ?? "КЛУБ ДЛЯ ТЕХ, КТО ВЫБИРАЕТ ПРИКЛЮЧЕНИЯ");
  const currentPromo = promos.length > 0 ? promos[bgIndex % promos.length] : undefined;

  return (
    <section className="relative overflow-hidden rounded-[36px] text-gabi-dark shadow-glow">
      <div className="absolute inset-0 z-0" aria-hidden>
        {currentBg && <Image src={currentBg} alt="Hero background" fill className="object-cover transition-opacity duration-700" priority />}
      </div>
      <div className="absolute inset-0 hero-haze" aria-hidden />

      <div className="relative z-20 px-6 py-12 md:px-12 lg:px-16 lg:py-16">
        <div className="grid items-start gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <div className="space-y-3">
              <span className="badge w-fit">{clubName}</span>
              <h1 className="font-display text-4xl uppercase tracking-[0.18em] leading-[1.05] md:text-6xl text-gabi-blue">
                {l1}
                {l2 && (<><br />{l2}</>)}
                {l3 && (<><br />{l3}</>)}
              </h1>
              <p className="max-w-2xl text-base text-slate-700 md:text-lg">
                {description ?? "Тренируйся системно. Развивайся с GABI — лыжи, роллеры, бег с вниманием к деталям и технике."}
              </p>
            </div>

            <div className="mt-8 w-full max-w-sm gradient-card">
              <div className="relative z-10 p-6 md:p-7">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]">Готовы начать?</h3>
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
                    key={src + String(idx)}
                    onClick={() => setBgIndex(idx)}
                    className={clsx("h-2.5 w-6 rounded-full transition", idx === bgIndex ? "bg-white" : "bg-white/40 hover:bg-white/70")}
                    aria-label={`Слайд ${idx + 1}`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            {currentPromo && (
              <a href={currentPromo.href} className="relative block h-[420px] overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur shadow-glow">
                {currentPromo.image && <Image src={currentPromo.image} alt={currentPromo.title} fill className="object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/80">Анонс</div>
                  <div className="text-lg font-semibold text-white">{currentPromo.title}</div>
                  {currentPromo.subtitle && <div className="text-white/80">{currentPromo.subtitle}</div>}
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
