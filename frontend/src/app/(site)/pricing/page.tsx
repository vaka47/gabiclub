export const dynamic = "force-dynamic";
export const revalidate = 0;

import LeadCtaButton from "@/components/LeadCtaButton";
import PlanTabs from "@/components/PlanTabs";
import SessionTariffCarousel from "@/components/SessionTariffCarousel";
import { getClubProfile, getSessionTariffs, getTrainingPlans } from "@/lib/api";

export default async function PricingPage() {
  const [sessionTariffs, plans, club] = await Promise.all([
    getSessionTariffs(),
    getTrainingPlans(),
    getClubProfile(),
  ]);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative mt-6 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-r from-gabi-blue/5 via-white to-gabi-orange/5 px-8 py-16 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.35)]">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gabi-blue/70">
            GABI CLUB
          </p>
          <h1 className="text-4xl font-semibold text-gabi-dark sm:text-5xl">
            Все тарифы на тренировки и планы в одном месте
          </h1>
          <p className="text-lg text-slate-600">
            {club?.mission ??
              "Подберите формат взаимодействия с тренерами: персональные занятия, абонементы и продвинутые тренировочные планы."}
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <LeadCtaButton className="btn-primary" label="Получить консультацию" source="pricing-hero" />
          <a href="tel:+79309341395" className="btn-secondary">
            Позвонить клубу
          </a>
        </div>
      </section>

      <SessionTariffCarousel tariffs={sessionTariffs} />

      <PlanTabs plans={plans} />

      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_-25px_rgba(15,23,42,0.15)]">
        <div className="relative flex flex-col gap-6 px-8 py-14 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-3">
            <h3 className="text-3xl font-semibold uppercase tracking-[0.2em] text-gabi-dark">
              Нужен совет?
            </h3>
            <p className="text-sm text-slate-600">
              Мы поможем сориентироваться в форматах, тренерах и расписании. Оставьте контакты или
              позвоните — команда ответит в ближайшее время.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="tel:+79309341395" className="btn-secondary">
              Позвонить клубу
            </a>
            <LeadCtaButton label="Оставить заявку" className="btn-primary" source="pricing-cta" />
          </div>
        </div>
      </section>
    </div>
  );
}
