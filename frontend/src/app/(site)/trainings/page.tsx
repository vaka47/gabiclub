'use client'

import CoachShowcase from "@/components/CoachShowcase";
import HeroSection from "@/components/HeroSection";
import LeadCtaButton from "@/components/LeadCtaButton";
import PlanTabs from "@/components/PlanTabs";
import ScheduleExplorer from "@/components/ScheduleExplorer";
import { getClubProfile, getCoaches, getTrainingMeta, getTrainingPlans, getTrainingSessions } from "@/lib/api";


export default async function TrainingsPage() {
  const [plans, meta, sessions, coaches, club] = await Promise.all([
    getTrainingPlans(),
    getTrainingMeta(),
    getTrainingSessions(),
    getCoaches(),
    getClubProfile(),
  ]);

  const featuredCoaches = coaches.filter((coach) => coach.is_featured);

  return (
    <div className="space-y-20 pb-10">
      <HeroSection
        slides={club.hero_slides ?? []}
        clubName={club.name}
        tagline={club.tagline}
        description={club.hero_description}
      />

      <PlanTabs plans={plans} />

      <ScheduleExplorer
        sessions={sessions}
        directions={meta.directions}
        coaches={meta.coaches}
        locations={meta.locations}
        levels={meta.levels}
      />

      <CoachShowcase coaches={featuredCoaches} />

      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-gabi-blue to-gabi-red text-white shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" aria-hidden />
        <div className="relative flex flex-col gap-6 px-8 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h3 className="text-3xl font-semibold uppercase tracking-[0.2em]">Готовы к старту?</h3>
            <p className="text-sm text-white/85">
              Мы поможем подобрать программу, тариф и тренера под вашу цель. Оставьте контакты — и команда свяжется с вами.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="tel:+79992003030" className="btn-secondary border-white/70 bg-white/10 text-white">
              Позвонить клубу
            </a>
            <LeadCtaButton label="Записаться сейчас" className="btn-primary" source="trainings-cta" />
          </div>
        </div>
      </section>
    </div>
  );
}
