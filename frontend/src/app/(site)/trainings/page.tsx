export const dynamic = 'force-dynamic';
export const revalidate = 0;

import CoachShowcase from "@/components/CoachShowcase";
import HeroSection from "@/components/HeroSection";
import LeadCtaButton from "@/components/LeadCtaButton";
import PlanTabs from "@/components/PlanTabs";
import ScheduleExplorer from "@/components/ScheduleExplorer";
import { getArticles, getCamps, getClubProfile, getCoaches, getTheme, getTrainingMeta, getTrainingPlans, resolveMediaUrl } from "@/lib/api";
// (animations handled inside client components)


export default async function TrainingsPage() {
  const [plans, meta, coaches, club, theme, camps, articles] = await Promise.all([
    getTrainingPlans(),
    getTrainingMeta(),
    getCoaches(),
    getClubProfile(),
    getTheme(),
    getCamps(new URLSearchParams("is_featured=1")),
    getArticles(new URLSearchParams("is_featured=1")),
  ]);

  const featuredCoaches = coaches.filter((coach) => coach.is_featured);
  // form photo no longer used inline; hero background slideshow is controlled via env/club slides

  return (
    <div className="space-y-20 pb-10">
      <HeroSection
        slides={club.hero_slides ?? []}
        clubName={club.name}
        tagline={club.tagline}
        description={club.hero_description}
        promos={[
          ...(camps ?? []).slice(0, 3).map((c) => ({
            id: `camp-${c.id}`,
            title: c.title,
            subtitle: `${new Date(c.start_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })} – ${new Date(c.end_date).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}`,
            image: resolveMediaUrl(c.hero_image || c.header_image) ?? undefined,
            href: `/camps/${c.slug}`,
          })),
          ...(articles ?? []).slice(0, 3).map((a) => ({
            id: `article-${a.id}`,
            title: a.title,
            subtitle: a.excerpt,
            image: resolveMediaUrl(a.cover_image) ?? undefined,
            href: `/blog/${a.slug}`,
            label: 'Статья',
          })),
        ]}
      />

      <PlanTabs plans={plans} />

      <ScheduleExplorer
        sessions={[]}
        directions={meta.directions}
        coaches={meta.coaches}
        locations={meta.locations}
        levels={meta.levels}
      />

      <CoachShowcase coaches={featuredCoaches} />

      <section
        className="relative overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.15)] border border-slate-200"
      >
        <div className="relative flex flex-col gap-6 px-8 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h3 className="text-3xl font-semibold uppercase tracking-[0.2em] text-gabi-dark">Готовы к старту?</h3>
            <p className="text-sm text-slate-600">
              Мы поможем подобрать программу, тариф и тренера под вашу цель. Оставьте контакты — и команда свяжется с вами.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="tel:+79992003030" className="btn-secondary">
              Позвонить клубу
            </a>
            <LeadCtaButton label="Записаться сейчас" className="btn-primary" source="trainings-cta" />
          </div>
        </div>
      </section>
    </div>
  );
}
