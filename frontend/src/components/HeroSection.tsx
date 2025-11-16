"use client";

import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import type { HeroSlide } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";
import DebugImage from "./DebugImage";

type PromoItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  label?: string;
  startDate?: string;
};
type HeroSectionProps = { slides: HeroSlide[]; clubName: string; tagline?: string; description?: string; promos?: PromoItem[] };

const AUTO_SWITCH = 6000;
const PROMO_SWITCH = 4500;
const PROMO_FADE_MS = 700;
const FADE_MS = 900;
const EDGE_SAMPLE_SIZE = 48;
const EDGE_BAND = 8;
const EDGE_ALPHA = 0.82;

function splitHeading(rawText: string): [string, string, string] {
  const raw = rawText.toUpperCase();
  // Aim: line1 = before "КТО" (keeps comma), line2 = "КТО ..." until anchor, line3 = anchor word (e.g. "РЕЗУЛЬТАТ")
  const ktoIdx = raw.indexOf("КТО");
  if (ktoIdx === -1) return [raw, "", ""];
  const before = raw.slice(0, ktoIdx).trim();
  const rest = raw.slice(ktoIdx).trim();
  const thirdLineAnchors = ["РЕЗУЛЬТАТ", "ПРИКЛЮЧЕНИЯ"];
  const anchor = thirdLineAnchors.find((word) => rest.includes(word));
  if (!anchor) return [before, rest, ""];
  const anchorIdx = rest.indexOf(anchor);
  const line2 = rest.slice(0, anchorIdx).trim();
  const line3 = rest.slice(anchorIdx).trim();
  return [before, line2, line3];
}

function sampleEdgeColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.fetchPriority = "low";
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = EDGE_SAMPLE_SIZE;
        canvas.height = EDGE_SAMPLE_SIZE;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(img, 0, 0, EDGE_SAMPLE_SIZE, EDGE_SAMPLE_SIZE);
        const { data } = context.getImageData(0, 0, EDGE_SAMPLE_SIZE, EDGE_SAMPLE_SIZE);
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        for (let y = 0; y < EDGE_SAMPLE_SIZE; y += 1) {
          for (let x = 0; x < EDGE_SAMPLE_SIZE; x += 1) {
            const isEdge =
              y < EDGE_BAND || x < EDGE_BAND || x >= EDGE_SAMPLE_SIZE - EDGE_BAND || y >= EDGE_SAMPLE_SIZE - EDGE_BAND;
            if (!isEdge) continue;
            const idx = (y * EDGE_SAMPLE_SIZE + x) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count += 1;
          }
        }
        if (!count) {
          resolve(null);
          return;
        }
        const avgR = Math.round(r / count);
        const avgG = Math.round(g / count);
        const avgB = Math.round(b / count);
        resolve(`rgba(${avgR}, ${avgG}, ${avgB}, ${EDGE_ALPHA})`);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
  });
}

export default function HeroSection({ slides: _slides, clubName, tagline, description, promos = [] }: HeroSectionProps) {
  const bgSlides = useMemo(() => {
    // Fixed order backgrounds for hero: primary group photo first, then two alternates
    const ordered = ["/gabigroup-main.jpg", "/hero-1-min.jpg", "/hero-2-min.jpg"];
    return ordered
      .map((src) => resolveMediaUrl(src) ?? src)
      .filter(Boolean) as string[];
  }, []);

  const initialPromoIndex = useMemo(() => {
    if (!promos.length) return 0;
    const now = Date.now();
    let bestFuture = Number.POSITIVE_INFINITY;
    let bestPast = Number.POSITIVE_INFINITY;
    let picked = 0;
    promos.forEach((promo, idx) => {
      if (!promo.startDate) return;
      const ts = Date.parse(promo.startDate);
      if (Number.isNaN(ts)) return;
      const delta = ts - now;
      if (delta >= 0 && delta < bestFuture) {
        bestFuture = delta;
        picked = idx;
      } else if (bestFuture === Number.POSITIVE_INFINITY && -delta < bestPast) {
        bestPast = -delta;
        picked = idx;
      }
    });
    return picked;
  }, [promos]);

  const [bgIndex, setBgIndex] = useState(0);
  const [prevBg, setPrevBg] = useState<string | null>(null);
  const [promoIndex, setPromoIndex] = useState(initialPromoIndex);
  const [prevPromoIndex, setPrevPromoIndex] = useState<number | null>(null);
  const [loadedPromos, setLoadedPromos] = useState<Record<string, boolean>>({});

  const markPromoLoaded = useCallback((id: string | number) => {
    const key = String(id);
    setLoadedPromos((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  useEffect(() => {
    setPromoIndex(initialPromoIndex);
  }, [initialPromoIndex]);

  useEffect(() => {
    if (bgSlides.length < 2) return;
    const timer = setInterval(() => {
      setBgIndex((p) => {
        setPrevBg(bgSlides[p] ?? null);
        return (p + 1) % bgSlides.length;
      });
    }, AUTO_SWITCH);
    return () => clearInterval(timer);
  }, [bgSlides.length]);

  useEffect(() => {
    if (promos.length < 2) return;
    const timer = setInterval(() => {
      setPromoIndex((p) => {
        setPrevPromoIndex(p);
        return (p + 1) % promos.length;
      });
    }, PROMO_SWITCH);
    return () => clearInterval(timer);
  }, [promos.length]);

  // Preload promo images to avoid flashes when switching
  useEffect(() => {
    if (typeof window === "undefined") return;
    promos.forEach((promo) => {
      if (!promo.image) return;
      const img = new window.Image();
      img.decoding = "async";
      (img as any).fetchPriority = "high";
      img.src = promo.image;
      img.onload = () => markPromoLoaded(promo.id);
      if (img.complete) {
        markPromoLoaded(promo.id);
      }
    });
  }, [promos, markPromoLoaded]);

  const currentBg = bgSlides[bgIndex] ?? null;
  const currentPromo = promos.length > 0 ? promos[promoIndex % promos.length] : undefined;
  const prevPromo = prevPromoIndex !== null ? promos[prevPromoIndex] : undefined;
  const currentLoaded = currentPromo ? !!loadedPromos[String(currentPromo.id)] : true;

  useEffect(() => {
    if (prevPromoIndex === null) return;
    if (!currentLoaded) return;
    const t = setTimeout(() => setPrevPromoIndex(null), PROMO_FADE_MS);
    return () => clearTimeout(t);
  }, [prevPromoIndex, currentLoaded]);

  const [edgeColors, setEdgeColors] = useState<Record<string, string>>({});
  const [l1, l2, l3] = splitHeading(tagline ?? "КЛУБ ДЛЯ ТЕХ, КТО ВЫБИРАЕТ РЕЗУЛЬТАТ");
  const heroDescriptionVariants = useMemo<ReactNode[]>(() => {
    return [
      (
        <>
          <span className="hidden md:inline">
            Лыжи, роллеры и бег под руководством Габриеллы Калугер и Андрея Краснова.
          </span>
          <span className="md:hidden inline">
            <span>Лыжи, роллеры и бег</span>
            <br />
            <span>под руководством Габриеллы</span>
            <br />
            <span>Калугер и Андрея Краснова.</span>
          </span>
        </>
      ),
      (
        <>
          <span className="hidden md:inline">
            Тренируем спортсменов разного уровня подготовки в Санкт-Петербурге и работаем онлайн.
          </span>
          <span className="md:hidden inline">
            <span>Тренируем спортсменов разного уровня</span>
            <br />
            <span>подготовки в Санкт-Петербурге</span>
            <br />
            <span>и работаем онлайн.</span>
          </span>
        </>
      ),
      (
        <>
          <span className="hidden md:inline">
            Помогаем кататься технично и добиваться результатов, получая удовольствие от тренировок.
          </span>
          <span className="md:hidden inline">
            <span>Помогаем кататься технично</span>
            <br />
            <span>и добиваться результатов,</span>
            <br />
            <span>получая удовольствие</span>
            <br />
            <span>от тренировок.</span>
          </span>
        </>
      ),
    ];
  }, []);
  const fallbackDescription = description ?? "Лыжи, роллеры и бег под руководством Габриеллы Калугер и Андрея Краснова.";
  const descNode = heroDescriptionVariants.length
    ? heroDescriptionVariants[bgIndex % heroDescriptionVariants.length]
    : fallbackDescription;

  useEffect(() => {
    if (!prevBg) return;
    const t = setTimeout(() => setPrevBg(null), FADE_MS);
    return () => clearTimeout(t);
  }, [prevBg]);

  // Preload all backgrounds once on mount to make crossfade smooth
  useEffect(() => {
    if (typeof window === "undefined") return;
    bgSlides.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      (img as any).decoding = "async";
      (img as any).fetchPriority = "high";
    });
  }, [bgSlides]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    bgSlides.forEach((src) => {
      if (!src || edgeColors[src]) return;
      sampleEdgeColor(src).then((color) => {
        if (!cancelled && color) {
          setEdgeColors((prev) => (prev[src] ? prev : { ...prev, [src]: color }));
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [bgSlides, edgeColors]);

  const heroEdgeColor = currentBg ? edgeColors[currentBg] : undefined;
  const edgeStyle = heroEdgeColor ? ({ "--hero-edge-color": heroEdgeColor } as CSSProperties) : undefined;

  // Wordmark now rendered as text using Halenoir (self-hosted); PNG/SVG is no longer needed

  const renderPromoCard = (promo: PromoItem, state: "current" | "prev") => {
    const isCurrent = state === "current";
    const promoKey = String(promo.id);
    const isLoaded = !!loadedPromos[promoKey];
    const isVisible = isCurrent ? isLoaded : !currentLoaded;

    return (
      <a
        key={promo.id}
        href={promo.href}
        className={clsx(
          "absolute inset-0 block h-full overflow-hidden rounded-3xl border border-white/40 bg-white/70 backdrop-blur shadow-glow transition-opacity duration-700 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
          isCurrent ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {promo.image && (
          <DebugImage
            debugName={`hero-promo:${promo.id}`}
            src={promo.image}
            alt={promo.title}
            fill
            className="object-cover"
            onLoad={() => markPromoLoaded(promo.id)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/80">
            {promo.label ?? (typeof promo.id === "string" && promo.id.startsWith("article-") ? "Статья" : "Анонс")}
          </div>
          <div className="text-lg font-semibold text-white">{promo.title}</div>
          {promo.subtitle && <div className="text-white/80">{promo.subtitle}</div>}
        </div>
      </a>
    );
  };

  return (
    <section className="relative overflow-hidden rounded-[36px] text-gabi-dark shadow-glow" style={edgeStyle}>
      <div className="absolute inset-0 z-0" aria-hidden>
        {prevBg && (
          <img
            src={prevBg}
            alt=""
            className="hero-bg-image absolute inset-0 h-full w-full object-cover pointer-events-none fade-out"
            loading="eager"
          />
        )}
        {currentBg && (
          <img
            src={currentBg}
            alt="Hero background"
            className="hero-bg-image absolute inset-0 h-full w-full object-cover pointer-events-none fade-in"
            loading="eager"
          />
        )}
      </div>
      <div className="absolute inset-0 hero-edge-bleed" aria-hidden />
      <div className="absolute inset-0 hero-haze" aria-hidden />

      <div className="relative z-20 px-6 py-10 md:px-12 lg:px-16 md:py-12 lg:py-14">
        <div className="grid items-start gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="max-w-3xl">
            <div className="space-y-4">
              {/* Wordmark as text (Halenoir) */}
              <div
                className="font-wordmark text-[42px] leading-none md:text-[56px] lg:text-[72px]"
                style={{ color: "rgb(20, 80, 170)" }}
              >
                GABI
              </div>
              <h1
                className="font-wordmark text-3xl uppercase tracking-[0.18em] leading-[1.05] md:text-5xl"
                style={{ color: "#FF6A00" }}
              >
                {l1}
                {l2 && (<><br />{l2}</>)}
                {l3 && (<><br />{l3}</>)}
              </h1>

              <p className="hero-desc max-w-2xl text-base text-slate-700 md:text-lg">{descNode}</p>
            </div>

            {/* Primary CTA */}
            <LeadCtaButton
              label="Присоединиться к GABI"
              className="btn-primary mt-6"
              source="hero-cta"
              style={{ backgroundColor: "rgb(20, 80, 170)", borderRadius: 14, padding: "16px 28px" }}
            />

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
                    onClick={() => {
                      setPrevBg(currentBg);
                      setBgIndex(idx);
                    }}
                    className={clsx("h-2.5 w-6 rounded-full transition", idx === bgIndex ? "bg-white" : "bg-white/40 hover:bg-white/70")}
                    aria-label={`Слайд ${idx + 1}`}
                    type="button"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <div className="relative h-[420px]">
              {prevPromo && renderPromoCard(prevPromo, "prev")}
              {currentPromo && renderPromoCard(currentPromo, "current")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
