export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { notFound } from "next/navigation";

import CampGallery from "@/components/CampGallery";
import LeadCtaButton from "@/components/LeadCtaButton";
import SessionTariffCarousel from "@/components/SessionTariffCarousel";
import TariffVideoBlock from "@/components/TariffVideoBlock";
import { getSessionTariffBySlug, getSessionTariffs } from "@/lib/api";

type SessionTariffDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const formatPrice = (value: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "По запросу";
  if (value <= 0) return "0 ₽";
  return `${value.toLocaleString("ru-RU")} ₽`;
};

const buildTariffLabel = (title: string) =>
  `ТАРИФ "${title.toLocaleUpperCase("ru-RU")}"`;
const normalizeDescription = (value?: string | null) =>
  value?.replace(/\s*\r?\n+\s*/g, " ").trim() ||
  "Описание этого тарифа занятий скоро появится.";

export default async function SessionTariffDetailPage({
  params,
}: SessionTariffDetailPageProps) {
  const { slug } = await params;
  const [tariff, tariffs] = await Promise.all([
    getSessionTariffBySlug(slug),
    getSessionTariffs(),
  ]);

  if (!tariff) {
    notFound();
  }

  const photos = [...(tariff.photos ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const benefits = [...(tariff.benefits ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const priceOptions = [...(tariff.prices ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const primaryPrice = priceOptions[0];
  const heroPhoto = photos[0]?.image ?? null;
  const otherTariffs = tariffs.filter((item) => item.id !== tariff.id);
  const accentPrice = primaryPrice
    ? `${priceOptions.length > 1 ? "от " : ""}${formatPrice(primaryPrice.price)}`
    : "По запросу";
  const description = normalizeDescription(tariff.description);

  return (
    <div className="space-y-16 pb-16">
      <section>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <h1 className="section-title max-w-4xl text-left">
              {buildTariffLabel(tariff.title)}
            </h1>
            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-3">
                <span className="font-display text-4xl font-semibold tracking-[0.08em] text-gabi-blue sm:text-5xl">
                  {accentPrice}
                </span>
              </div>
            </div>
          </div>

          <LeadCtaButton
            className="btn-primary w-full justify-center px-8 lg:w-auto"
            label="Узнать подробнее"
            source={`session-tariff-${tariff.slug ?? tariff.id}`}
            initial={{
              preferred_direction: tariff.title,
              message: `Хочу узнать подробнее о тарифе занятий "${tariff.title}"`,
            }}
          />
        </div>
      </section>

      {(tariff.video_vk_embed_url || tariff.video_file) && (
        <section className="space-y-5">
          <TariffVideoBlock
            title={tariff.title}
            videoFile={tariff.video_file}
            videoVkEmbedUrl={tariff.video_vk_embed_url}
            poster={tariff.video_cover_image ?? heroPhoto}
          />
        </section>
      )}

      <section className="space-y-6">
        <p className="w-full text-base leading-8 text-slate-600 whitespace-normal sm:text-[1.05rem]">
          {description}
        </p>

        {benefits.length > 0 && (
          <div className="space-y-4">
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
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(243,247,255,0.96))] px-6 py-6 shadow-[0_28px_90px_-50px_rgba(15,23,42,0.3)] sm:px-8 lg:rounded-none lg:border-0 lg:bg-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
            {priceOptions.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {priceOptions.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-[24px] border border-slate-200/80 bg-white/95 px-5 py-4 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.28)]"
                  >
                    <p className="text-sm leading-6 text-slate-500">
                      {option.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-gabi-blue sm:text-[1.8rem]">
                      {formatPrice(option.price)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-600">
                Стоимость уточняйте у администратора клуба.
              </p>
            )}

            <LeadCtaButton
              className="btn-primary w-full justify-center px-8 lg:w-auto"
              label="Узнать подробнее"
              source={`session-tariff-side-${tariff.slug ?? tariff.id}`}
              initial={{
                preferred_direction: tariff.title,
                message: `Хочу узнать подробнее о тарифе занятий "${tariff.title}"`,
              }}
            />
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600 sm:text-base">
          Оставьте контакты, и мы подскажем, какой тариф лучше взять под ваш
          формат занятий, количество посещений и тренера.
        </p>
      </section>

      {photos.length > 0 && (
        <section className="space-y-8">
          <div className="h-px w-full bg-[linear-gradient(90deg,rgba(31,111,235,0),rgba(31,111,235,0.7),rgba(255,164,87,0.55),rgba(31,111,235,0))]" />
          <CampGallery
            slug={tariff.slug ?? String(tariff.id)}
            title={tariff.title}
            photos={photos}
            layout="carousel"
          />
        </section>
      )}

      {otherTariffs.length > 0 && (
        <SessionTariffCarousel
          tariffs={otherTariffs}
          title="Другие тарифы занятий"
          subtitle="Можно быстро сравнить соседние форматы и открыть полную страницу каждого тарифа."
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
