"use client";

import { clsx } from "clsx";
import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { HeroSlide } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";

type PromoItem = { id: string | number; title: string; subtitle?: string; image?: string; href: string };
type HeroSectionProps = { slides: HeroSlide[]; clubName: string; tagline?: string; description?: string; promos?: PromoItem[] };

const AUTO_SWITCH = 6000;
const FADE_MS = 900;
const EDGE_SAMPLE_SIZE = 48;
const EDGE_BAND = 8;
const EDGE_ALPHA = 0.82;

function splitHeading(rawText: string): [string, string, string] {
  const raw = rawText.toUpperCase();
  // Aim: line1 = before "КТО" (keeps comma), line2 = "КТО ..." until "ПРИКЛЮЧЕНИЯ", line3 = from "ПРИКЛЮЧЕНИЯ"
  const ktoIdx = raw.indexOf("КТО");
  if (ktoIdx === -1) return [raw, "", ""];
  const before = raw.slice(0, ktoIdx).trim();
  const rest = raw.slice(ktoIdx).trim();
  const prIdx = rest.indexOf("ПРИКЛЮЧЕНИЯ");
  if (prIdx === -1) return [before, rest, ""];
  const line2 = rest.slice(0, prIdx).trim();
  const line3 = rest.slice(prIdx).trim();
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

export default function HeroSection({ slides, clubName, tagline, description, promos = [] }: HeroSectionProps) {
  const envSlides = useMemo(() => [process.env.NEXT_PUBLIC_HERO_BG_1, process.env.NEXT_PUBLIC_HERO_BG_2].filter(Boolean).map((s) => resolveMediaUrl(String(s))) as string[], []);
  const bgSlides = useMemo(() => {
    const fromClub = slides.map((s) => resolveMediaUrl(s.image) ?? s.image).filter(Boolean) as string[];
    return envSlides.length > 0 ? envSlides : fromClub;
  }, [slides, envSlides]);

  const [bgIndex, setBgIndex] = useState(0);
  const [prevBg, setPrevBg] = useState<string | null>(null);
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

  const currentBg = bgSlides[bgIndex] ?? null;
  const [edgeColors, setEdgeColors] = useState<Record<string, string>>({});
  const [l1, l2, l3] = splitHeading(tagline ?? "КЛУБ ДЛЯ ТЕХ, КТО ВЫБИРАЕТ ПРИКЛЮЧЕНИЯ");
  const currentPromo = promos.length > 0 ? promos[bgIndex % promos.length] : undefined;

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
                style={{ color: "rgb(36, 70, 95)" }}
              >
                GABI
              </div>
              <h1
                className="font-wordmark text-3xl uppercase tracking-[0.18em] leading-[1.05] md:text-5xl"
                style={{ color: "rgb(32, 64, 88)" }}
              >
                {l1}
                {l2 && (<><br />{l2}</>)}
                {l3 && (<><br />{l3}</>)}
              </h1>

              <p className="max-w-2xl text-base text-slate-700 md:text-lg">
                {description ?? "Тренируйся системно. Развивайся с GABI — лыжи, роллеры, бег с вниманием к деталям и технике."}
              </p>
            </div>

            {/* Compact inline CTA row */}
            <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-white/15 bg-black/55 px-5 py-4 backdrop-blur-sm">
              <div className="text-base font-semibold text-white">Готовы начать?</div>
              <LeadCtaButton label="Записаться" className="btn-primary" source="hero-cta" />
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
