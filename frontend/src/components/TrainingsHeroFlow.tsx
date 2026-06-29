"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

import type { HeroSlide, TrainingDirection } from "@/lib/types";
import ActivityTabs from "./ActivityTabs";
import HeroSection from "./HeroSection";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const INTRO_TEXTS = [
  "Лыжи, лыжероллеры и ОФП. Технично и с удовольствием под руководством Габриеллы Калугер и Андрея Краснова.",
  "Современные методики, забота о здоровье учеников и индивидуальный подход.",
  "Помогаем добиваться результатов новичкам и опытным спортсменам в Санкт-Петербурге и онлайн.",
];
const EXIT_PHASE = INTRO_TEXTS.length + 1;
const WHEEL_THRESHOLD = 24;
const TOUCH_THRESHOLD = 42;
const TRANSITION_LOCK_MS = 760;
const EXIT_DELAY_MS = 440;

type PromoItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  href: string;
  label?: string;
  startDate?: string;
};

type TrainingsHeroFlowProps = {
  slides: HeroSlide[];
  clubName: string;
  tagline?: string;
  description?: string;
  promos?: PromoItem[];
  directions: TrainingDirection[];
};

export default function TrainingsHeroFlow({
  slides,
  clubName,
  tagline,
  description,
  promos = [],
  directions,
}: TrainingsHeroFlowProps) {
  const heroRegionRef = useRef<HTMLDivElement | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lockTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [shouldUseIntro, setShouldUseIntro] = useState(false);
  const [introPhase, setIntroPhase] = useState(0);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [isTransitionLocked, setIsTransitionLocked] = useState(false);

  const introActive = isDesktop && shouldUseIntro && !introCompleted;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const syncDesktop = () => {
      setIsDesktop(media.matches);
    };

    syncDesktop();
    setShouldUseIntro(media.matches && window.scrollY <= 8);
    media.addEventListener?.("change", syncDesktop);

    return () => {
      media.removeEventListener?.("change", syncDesktop);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
      }
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!introActive || typeof document === "undefined") return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, [introActive]);

  useEffect(() => {
    if (!introCompleted || !shouldUseIntro || typeof window === "undefined") return;

    const rafId = window.requestAnimationFrame(() => {
      const targetScrollTop = heroRegionRef.current?.offsetHeight ?? window.innerHeight;
      window.scrollTo({ top: Math.max(targetScrollTop, 0), behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [introCompleted, shouldUseIntro]);

  const lockTransitions = () => {
    setIsTransitionLocked(true);
    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
    }
    lockTimerRef.current = window.setTimeout(() => {
      setIsTransitionLocked(false);
      lockTimerRef.current = null;
    }, TRANSITION_LOCK_MS);
  };

  const completeIntro = () => {
    lockTransitions();
    setIntroPhase(EXIT_PHASE);
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
    }
    exitTimerRef.current = window.setTimeout(() => {
      setIntroCompleted(true);
      setIntroPhase(0);
      exitTimerRef.current = null;
    }, EXIT_DELAY_MS);
  };

  const moveIntro = (direction: 1 | -1) => {
    if (!introActive || isTransitionLocked) return;

    if (direction < 0) {
      if (introPhase === 0) return;
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      lockTransitions();
      setIntroPhase((current) => Math.max(current - 1, 0));
      return;
    }

    if (introPhase < INTRO_TEXTS.length) {
      lockTransitions();
      setIntroPhase((current) => current + 1);
      return;
    }

    completeIntro();
  };

  useEffect(() => {
    if (!introActive || typeof window === "undefined") return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) return;
      event.preventDefault();
      moveIntro(event.deltaY > 0 ? 1 : -1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        moveIntro(1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        moveIntro(-1);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY ?? null;
      touchStartYRef.current = null;
      if (startY === null || endY === null) return;
      const deltaY = startY - endY;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
      moveIntro(deltaY > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [introActive, introPhase, isTransitionLocked]);

  return (
    <div className="space-y-20">
      <div
        ref={heroRegionRef}
        className={clsx(
          "trainings-scroll-intro-shell",
          introActive && "is-intro-active",
        )}
      >
        <div
          className={clsx(
            "trainings-scroll-intro-stage",
            introActive && introPhase > 0 && "is-exiting",
          )}
        >
          <HeroSection
            slides={slides}
            clubName={clubName}
            tagline={tagline}
            description={description}
            promos={promos}
            hideRotatingCopy={introActive}
          />
        </div>

        {introActive && (
          <div className="trainings-scroll-intro-copy-layer" aria-live="polite">
            {INTRO_TEXTS.map((text, index) => {
              const slidePhase = index + 1;
              const stateClassName =
                slidePhase === introPhase
                  ? "is-active"
                  : introPhase > slidePhase
                    ? "is-past"
                    : "is-future";

              return (
                <p
                  key={text}
                  className={clsx("trainings-scroll-intro-copy", stateClassName)}
                >
                  {text}
                </p>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={clsx(
          "transition-opacity duration-500",
          introActive && "lg:pointer-events-none lg:select-none lg:opacity-0",
        )}
        aria-hidden={introActive || undefined}
      >
        <ActivityTabs directions={directions} />
      </div>
    </div>
  );
}
