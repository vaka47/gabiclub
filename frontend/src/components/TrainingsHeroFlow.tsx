"use client";

import { useEffect, useState } from "react";

import type { HeroSlide, TrainingDirection } from "@/lib/types";
import ActivityTabs from "./ActivityTabs";
import HeroSection from "./HeroSection";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const INTRO_TOP_THRESHOLD = 8;
const INTRO_DISMISS_SCROLL_Y = 24;

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
  logoSrc?: string;
};

export default function TrainingsHeroFlow({
  slides,
  clubName,
  tagline,
  description,
  promos = [],
  directions,
  logoSrc,
}: TrainingsHeroFlowProps) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [hasDismissedIntro, setHasDismissedIntro] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const syncState = () => {
      const scrollY = window.scrollY;
      const atTop = scrollY <= INTRO_TOP_THRESHOLD;

      setIsDesktop(media.matches);
      setIsAtTop(atTop);
      if (scrollY > INTRO_DISMISS_SCROLL_Y) {
        setHasDismissedIntro(true);
      }
    };
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsAtTop(scrollY <= INTRO_TOP_THRESHOLD);
      if (scrollY > INTRO_DISMISS_SCROLL_Y) {
        setHasDismissedIntro(true);
      }
    };
    const handleMediaChange = () => {
      setIsDesktop(media.matches);
    };

    syncState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    media.addEventListener?.("change", handleMediaChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      media.removeEventListener?.("change", handleMediaChange);
    };
  }, []);

  const introOverlayActive = isDesktop && isAtTop && !hasDismissedIntro;

  return (
    <div className="space-y-20">
      <HeroSection
        slides={slides}
        clubName={clubName}
        tagline={tagline}
        description={description}
        promos={promos}
        hideRotatingCopy={introOverlayActive}
        introOverlayActive={introOverlayActive}
        introLogoSrc={logoSrc}
      />

      <div>
        <ActivityTabs directions={directions} />
      </div>
    </div>
  );
}
