export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";

import CampGallery from "@/components/CampGallery";
import DirectionLocationCircles from "@/components/DirectionLocationCircles";
import LeadCtaButton from "@/components/LeadCtaButton";
import SessionTariffCarousel from "@/components/SessionTariffCarousel";
import { getTrainingDirectionBySlug } from "@/lib/api";

type TrainingDirectionPageProps = {
  params: {
    slug: string;
  };
};

const toBulletItems = (value?: string | null) =>
  (value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim().replace(/^[-•\s]+/, ""))
    .filter(Boolean);

export default async function TrainingDirectionPage({
  params,
}: TrainingDirectionPageProps) {
  const direction = await getTrainingDirectionBySlug(params.slug);

  if (!direction) {
    notFound();
    return null;
  }

  const locations = [...(direction.locations ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const photos = [...(direction.photos ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const tariffs = [...(direction.session_tariffs ?? [])];
  const benefitItems = toBulletItems(direction.benefits);
  const firstSessionItems = toBulletItems(direction.first_session_details);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_28px_90px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 px-8 py-10 sm:px-10 sm:py-12">
            <div className="space-y-4">
              {direction.icon ? (
                <div className="text-3xl text-gabi-blue/80">{direction.icon}</div>
              ) : null}
              <h1 className="max-w-3xl text-4xl font-semibold text-gabi-dark sm:text-5xl">
                {direction.title}
              </h1>
              {direction.description && (
                <p className="max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">
                  {direction.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <LeadCtaButton
                className="btn-primary"
                label="Заказать звонок"
                source={`training-direction-${direction.slug}`}
                initial={{
                  preferred_direction: direction.title,
                  message: `Хочу узнать подробнее про направление "${direction.title}"`,
                }}
              />
              <a href="#session-tariffs" className="btn-secondary">
                Тарифы
              </a>
            </div>
          </div>

          <div className="relative min-h-[280px] border-t border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.18),_transparent_42%),linear-gradient(135deg,_rgba(244,247,255,1),_rgba(235,240,248,0.96))] lg:min-h-full lg:border-l lg:border-t-0">
            {direction.cover_image ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${direction.cover_image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-transparent to-slate-950/55" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[72px] text-gabi-blue/35 sm:text-[96px]">
                {direction.icon || "•"}
              </div>
            )}
          </div>
        </div>
      </section>

      {(benefitItems.length > 0 || firstSessionItems.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-2">
          {benefitItems.length > 0 && (
            <article className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
              <h2 className="text-4xl font-semibold text-gabi-blue">Польза</h2>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {benefitItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gabi-blue/80"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          )}

          {firstSessionItems.length > 0 && (
            <article className="rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,_rgba(31,111,235,0.06),_rgba(255,255,255,1))] p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.3)]">
              <h2 className="text-4xl font-semibold text-gabi-orange">
                Первое занятие
              </h2>
              <ul className="mt-5 space-y-2 text-sm text-slate-600">
                {firstSessionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gabi-orange/80"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <LeadCtaButton
                className="btn-primary mt-6"
                label="Записаться"
                source={`training-direction-first-session-${direction.slug}`}
                initial={{
                  preferred_direction: direction.title,
                  message: `Хочу записаться на первое занятие по направлению "${direction.title}"`,
                }}
              />
            </article>
          )}
        </section>
      )}

      {locations.length > 0 && (
        <section className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="section-title section-accent md:whitespace-nowrap">
              Места проведения тренировок
            </h2>
          </div>
          <DirectionLocationCircles locations={locations} />
        </section>
      )}

      {tariffs.length > 0 ? (
        <div id="session-tariffs" className="scroll-mt-24 md:scroll-mt-32">
          <SessionTariffCarousel tariffs={tariffs} subtitle={null} />
        </div>
      ) : (
        <section
          id="session-tariffs"
          className="scroll-mt-24 rounded-[30px] border border-dashed border-slate-300 bg-white px-8 py-10 text-slate-600 md:scroll-mt-32"
        >
          Для этого направления ещё не выбраны тарифы занятий. Их можно добавить в
          админке направления.
        </section>
      )}

      {photos.length > 0 && (
        <section className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="section-title section-accent">Галерея</h2>
          </div>
          <CampGallery slug={direction.slug ?? String(direction.id)} title={direction.title} photos={photos} />
        </section>
      )}
    </div>
  );
}
