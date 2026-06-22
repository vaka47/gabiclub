export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";

import CampGallery from "@/components/CampGallery";
import DebugImage from "@/components/DebugImage";
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

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_28px_90px_-45px_rgba(15,23,42,0.35)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8 px-8 py-10 sm:px-10 sm:py-12">
            <div className="space-y-4">
              {tariff.category_display ? (
                <span className="badge w-fit">{tariff.category_display}</span>
              ) : null}
              <h1 className="max-w-3xl text-4xl font-semibold text-gabi-dark sm:text-5xl">
                {tariff.title}
              </h1>
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-sm uppercase tracking-[0.25em] text-slate-500">
                  стоимость
                </span>
                <span className="text-4xl font-semibold text-gabi-blue">
                  {primaryPrice ? `от ${formatPrice(primaryPrice.price)}` : "По запросу"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <LeadCtaButton
                className="btn-primary"
                label="Узнать подробнее"
                source={`session-tariff-${tariff.slug ?? tariff.id}`}
                initial={{
                  preferred_direction: tariff.title,
                  message: `Хочу узнать подробнее о тарифе занятий "${tariff.title}"`,
                }}
              />
            </div>
          </div>

          <div className="relative min-h-[280px] border-t border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.18),_transparent_42%),linear-gradient(135deg,_rgba(244,247,255,1),_rgba(235,240,248,0.96))] lg:min-h-full lg:border-l lg:border-t-0">
            {heroPhoto ? (
              <>
                <DebugImage
                  debugName={`session-tariff-hero:${tariff.slug ?? tariff.id}`}
                  src={heroPhoto}
                  alt={tariff.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/15 via-transparent to-slate-950/45" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(31,111,235,0.1),_rgba(255,164,87,0.18))]" />
            )}
          </div>
        </div>
      </section>

      {(tariff.video_vk_embed_url || tariff.video_file) && (
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <h2 className="section-title section-accent">Видео тарифа</h2>
            <p className="section-subtitle">
              Видео показываем только если его добавили в админке для этого тарифа.
            </p>
          </div>
          <TariffVideoBlock
            title={tariff.title}
            videoFile={tariff.video_file}
            videoVkEmbedUrl={tariff.video_vk_embed_url}
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
                {tariff.description?.trim() || "Описание этого тарифа занятий скоро появится."}
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
            {priceOptions.length > 0 ? (
              <ul className="space-y-3 text-sm text-slate-600">
                {priceOptions.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-gabi-blue/80"
                      aria-hidden
                    />
                    <span className="flex-1">{option.label}</span>
                    <span className="font-semibold text-gabi-blue">
                      {formatPrice(option.price)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-7 text-slate-600">
                Стоимость уточняйте у администратора клуба.
              </p>
            )}
          </div>
          <p className="text-sm leading-7 text-slate-600">
            Оставьте контакты, и мы подскажем, какой тариф лучше взять под ваш формат занятий, количество посещений и тренера.
          </p>
          <LeadCtaButton
            className="btn-primary w-full"
            label="Узнать подробнее"
            source={`session-tariff-side-${tariff.slug ?? tariff.id}`}
            initial={{
              preferred_direction: tariff.title,
              message: `Хочу узнать подробнее о тарифе занятий "${tariff.title}"`,
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
            slug={tariff.slug ?? String(tariff.id)}
            title={tariff.title}
            photos={photos}
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
    </div>
  );
}
