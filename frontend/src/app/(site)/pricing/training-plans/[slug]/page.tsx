export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";

import CampGallery from "@/components/CampGallery";
import DebugImage from "@/components/DebugImage";
import LeadCtaButton from "@/components/LeadCtaButton";
import PlanTabs from "@/components/PlanTabs";
import TariffVideoBlock from "@/components/TariffVideoBlock";
import { getTrainingPlanBySlug, getTrainingPlans } from "@/lib/api";

type TrainingPlanDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const formatPrice = (value: number) => `${value.toLocaleString("ru-RU")} ₽`;

export default async function TrainingPlanDetailPage({
  params,
}: TrainingPlanDetailPageProps) {
  const { slug } = await params;
  const [plan, plans] = await Promise.all([
    getTrainingPlanBySlug(slug),
    getTrainingPlans(),
  ]);

  if (!plan) {
    notFound();
  }

  const photos = [...(plan.photos ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const benefits = [...(plan.benefits ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const heroPhoto = photos[0]?.image ?? null;
  const otherPlans = plans.filter((item) => item.id !== plan.id);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_28px_90px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8 px-8 py-10 sm:px-10 sm:py-12">
            <div className="space-y-4">
              {plan.category_display ? (
                <span className="badge w-fit">{plan.category_display}</span>
              ) : null}
              <h1 className="max-w-3xl text-4xl font-semibold text-gabi-dark sm:text-5xl">
                {plan.title}
              </h1>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-4xl font-semibold text-gabi-blue">
                  {formatPrice(plan.price)}
                </span>
                <span className="pb-1 text-sm uppercase tracking-[0.25em] text-slate-500">
                  {plan.period}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <LeadCtaButton
                className="btn-primary"
                label="Узнать подробнее"
                source={`training-plan-${plan.slug ?? plan.id}`}
                initial={{
                  preferred_direction: plan.title,
                  message: `Хочу узнать подробнее о тренировочном плане "${plan.title}"`,
                }}
              />
            </div>
          </div>

          <div className="relative min-h-[280px] border-t border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.18),_transparent_42%),linear-gradient(135deg,_rgba(244,247,255,1),_rgba(235,240,248,0.96))] lg:min-h-full lg:border-l lg:border-t-0">
            {heroPhoto ? (
              <>
                <DebugImage
                  debugName={`training-plan-hero:${plan.slug ?? plan.id}`}
                  src={heroPhoto}
                  alt={plan.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/15 via-transparent to-slate-950/45" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[84px] text-gabi-blue/25">
                {plan.icon || "•"}
              </div>
            )}
          </div>
        </div>
      </section>

      {(plan.video_vk_embed_url || plan.video_file) && (
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <h2 className="section-title section-accent">Видео тарифа</h2>
            <p className="section-subtitle">
              Если для этого плана добавлено видео, его можно посмотреть прямо на странице.
            </p>
          </div>
          <TariffVideoBlock
            title={plan.title}
            videoFile={plan.video_file}
            videoVkEmbedUrl={plan.video_vk_embed_url}
            poster={heroPhoto}
          />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-gabi-dark">
                Описание тарифа
              </h2>
              <p className="text-base leading-8 text-slate-600 whitespace-pre-line">
                {plan.description?.trim() || "Описание этого тренировочного плана скоро появится."}
              </p>
            </div>

            {benefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gabi-dark">
                  Преимущества
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {benefits.map((benefit) => (
                    <li key={benefit.id} className="flex items-start gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gabi-blue/80"
                        aria-hidden
                      />
                      <span>{benefit.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </article>

        <aside className="card-surface space-y-5">
          <div className="space-y-3">
            <span className="badge w-fit">Стоимость</span>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-semibold text-gabi-blue">
                {formatPrice(plan.price)}
              </span>
              <span className="pb-1 text-sm uppercase tracking-[0.24em] text-slate-500">
                {plan.period}
              </span>
            </div>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            Оставьте контакты, и мы поможем понять, подходит ли этот формат под вашу цель, график и уровень подготовки.
          </p>
          <LeadCtaButton
            className="btn-primary w-full"
            label="Узнать подробнее"
            source={`training-plan-side-${plan.slug ?? plan.id}`}
            initial={{
              preferred_direction: plan.title,
              message: `Хочу узнать подробнее о тренировочном плане "${plan.title}"`,
            }}
          />
        </aside>
      </section>

      {photos.length > 0 && (
        <section className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="section-title section-accent">Фотографии тарифа</h2>
          </div>
          <CampGallery
            slug={plan.slug ?? String(plan.id)}
            title={plan.title}
            photos={photos}
          />
        </section>
      )}

      {otherPlans.length > 0 && (
        <PlanTabs
          plans={otherPlans}
          title="Другие тренировочные планы"
          subtitle="Посмотрите ещё несколько форматов, которые можно сравнить перед заявкой."
        />
      )}
    </div>
  );
}
