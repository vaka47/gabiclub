"use client";

import type { HeroSlide, TrainingDirection } from "@/lib/types";
import ActivityTabs from "./ActivityTabs";
import HeroSection from "./HeroSection";

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
}: TrainingsHeroFlowProps) {
  return (
    <div className="space-y-20">
      <HeroSection
        slides={slides}
        clubName={clubName}
        tagline={tagline}
        description={description}
        promos={promos}
        revealRotatingCopyOnLoad
      />

      <div>
        <ActivityTabs directions={directions} />
      </div>
    </div>
  );
}
