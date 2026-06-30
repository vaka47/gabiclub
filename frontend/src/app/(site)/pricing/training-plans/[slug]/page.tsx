export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";

import CampGallery from "@/components/CampGallery";
import LeadCtaButton from "@/components/LeadCtaButton";
import PlanTabs from "@/components/PlanTabs";
import { getTrainingPlanBySlug, getTrainingPlans } from "@/lib/api";

type TrainingPlanDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const formatPrice = (value: number) => `${value.toLocaleString("ru-RU")} ₽`;
const buildTariffLabel = (title: string) =>
  `ТАРИФ "${title.toLocaleUpperCase("ru-RU")}"`;
const normalizeDescription = (value?: string | null) =>
  value?.replace(/\s*\r?\n+\s*/g, " ").trim() ||
  "Описание этого тренировочного плана скоро появится.";

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
  const otherPlans = plans.filter((item) => item.id !== plan.id);
  const description = normalizeDescription(plan.description);

  return (
    <div className="space-y-16 pb-16">
      <section>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <h1 className="section-title max-w-4xl text-left">
              {buildTariffLabel(plan.title)}
            </h1>
            <div className="flex flex-wrap items-end gap-3">
              <span className="font-display text-4xl font-semibold tracking-[0.08em] text-gabi-blue sm:text-5xl">
                {formatPrice(plan.price)}
              </span>
              <span className="font-display pb-1 text-base tracking-[0.14em] text-slate-500 sm:text-lg">
                {plan.period}
              </span>
            </div>
          </div>

          <LeadCtaButton
            className="btn-primary w-full justify-center px-8 lg:w-auto"
            label="Узнать подробнее"
            source={`training-plan-${plan.slug ?? plan.id}`}
            initial={{
              preferred_direction: plan.title,
              message: `Хочу узнать подробнее о тренировочном плане "${plan.title}"`,
            }}
          />
        </div>
      </section>

      <section>
        <p className="w-full text-base leading-8 text-slate-600 whitespace-normal sm:text-[1.05rem]">
          {description}
        </p>
      </section>

      {photos.length > 0 && (
        <section className="space-y-8">
          <div className="h-px w-full bg-[linear-gradient(90deg,rgba(31,111,235,0),rgba(31,111,235,0.7),rgba(255,164,87,0.55),rgba(31,111,235,0))]" />
          <CampGallery
            slug={plan.slug ?? String(plan.id)}
            title={plan.title}
            photos={photos}
            layout="carousel"
          />
        </section>
      )}

      {benefits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gabi-dark">
            Преимущества тарифа
          </h2>
          <ul className="grid list-none gap-3 pl-0 text-sm text-slate-600 sm:text-base">
            {benefits.map((benefit) => (
              <li key={benefit.id} className="flex items-start gap-4">
                <span
                  className="mt-[0.7rem] h-2 w-2 shrink-0 rounded-full bg-gabi-blue"
                  aria-hidden
                />
                <span>{benefit.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,255,0.96))] px-6 py-6 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.3)] sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
              Стоимость
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-4xl font-semibold text-gabi-blue sm:text-[2.7rem]">
                {formatPrice(plan.price)}
              </span>
              <span className="pb-1 text-sm uppercase tracking-[0.24em] text-slate-500">
                {plan.period}
              </span>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Оставьте контакты, и мы поможем понять, подходит ли этот формат под
            вашу цель, график и уровень подготовки.
          </p>

          <LeadCtaButton
            className="btn-primary w-full justify-center px-8 lg:w-auto"
            label="Узнать подробнее"
            source={`training-plan-side-${plan.slug ?? plan.id}`}
            initial={{
              preferred_direction: plan.title,
              message: `Хочу узнать подробнее о тренировочном плане "${plan.title}"`,
            }}
          />
        </div>
      </section>

      {otherPlans.length > 0 && (
        <PlanTabs
          plans={otherPlans}
          title="Другие тренировочные планы"
          subtitle="Посмотрите ещё несколько форматов, которые можно сравнить перед заявкой."
        />
      )}

      <div className="flex justify-center pt-2">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-gabi-blue transition hover:text-gabi-dark"
        >
          <span aria-hidden>←</span>
          <span>Вернуться на страницу тарифов</span>
        </Link>
      </div>
    </div>
  );
}
