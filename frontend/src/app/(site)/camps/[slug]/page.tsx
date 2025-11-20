import Image from "next/image";
import DebugImage from "@/components/DebugImage";
import CampGallery from "@/components/CampGallery";
import CoachShowcase from "@/components/CoachShowcase";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import LeadCtaButton from "@/components/LeadCtaButton";
import { getCampBySlug, getCamps, resolveMediaUrl } from "@/lib/api";

function formatDate(date: string) {
  return format(new Date(date), "d MMMM yyyy", { locale: ru });
}

export async function generateStaticParams() {
  if (process.env.SKIP_API_AT_BUILD === '1') return [];
  const camps = await getCamps();
  return camps.map((camp) => ({ slug: camp.slug }));
}

export default async function CampDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);
  if (!camp) {
    notFound();
  }
  const highlights = camp.highlights ?? [];
  const inclusions = camp.inclusions ?? [];
  const gallery = camp.gallery ?? [];
  const program = camp.program ?? [];
  const trainers = camp.trainers ?? [];
  const price = Number(camp.price_from);
  // Desktop (md+): prefer header image; Mobile: prefer cover/hero image
  const desktopRaw = camp.header_image || camp.hero_image || null;
  const mobileRaw = camp.hero_image || camp.header_image || null;
  const desktopImg = desktopRaw ? (resolveMediaUrl(desktopRaw) ?? desktopRaw) : null;
  const mobileImg = mobileRaw ? (resolveMediaUrl(mobileRaw) ?? mobileRaw) : null;

  // Server-side debug: log hero and gallery media resolution (visible in server logs)
  if (process.env.NEXT_PUBLIC_DEBUG_MEDIA === '1') {
    console.log('[media] camp detail hero', { slug: camp.slug, mobile: mobileImg ?? undefined, desktop: desktopImg ?? undefined });
    if (camp.gallery?.length) {
      console.log('[media] camp detail gallery count', { slug: camp.slug, count: camp.gallery.length });
      for (const g of camp.gallery) {
        const resolved = resolveMediaUrl(g.image) ?? g.image;
        console.log('[media] camp gallery image', { id: g.id, raw: g.image, resolved });
      }
    }
  }

  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-6">
        <div className="relative h-[420px] overflow-hidden rounded-[32px]">
          {/* Mobile: show cover image */}
          {mobileImg && (
            <DebugImage
              debugName={`camp-hero-mobile:${camp.slug}`}
              src={mobileImg}
              alt={camp.title}
              fill
              className="object-cover md:hidden"
              priority
            />
          )}
          {/* Desktop: show header image */}
          {desktopImg ? (
            <DebugImage
              debugName={`camp-hero-desktop:${camp.slug}`}
              src={desktopImg}
              alt={camp.title}
              fill
              className="hidden object-cover md:block"
              priority
            />
          ) : (
            !mobileImg && (
              <div className="flex h-full items-center justify-center bg-gabi-blue/10 text-2xl font-semibold text-gabi-blue">
                {camp.title}
              </div>
            )
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 px-8 py-10 text-white">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white" style={{ backgroundColor: "rgba(255,255,255,0.25)" }}>
              {camp.status_display ?? camp.status}
            </span>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{camp.title}</h1>
            <p className="max-w-2xl text-sm text-white/80">{camp.summary}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              <span>{formatDate(camp.start_date)} — {formatDate(camp.end_date)}</span>
              <span>{camp.location}</span>
              <span>от {price.toLocaleString("ru-RU")} ₽</span>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-10 md:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8 text-slate-600">
          <h2 className="section-title section-accent text-2xl">О кэмпе</h2>
          <p className="text-base leading-relaxed whitespace-pre-line">{camp.description}</p>

          {camp.target_audience && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gabi-dark">Кому подойдёт этот кэмп?</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">{camp.target_audience}</p>
            </div>
          )}

          {inclusions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gabi-dark">Что входит в стоимость</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {inclusions.map((inc) => (
                  <li key={inc.id} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-gabi-blue" aria-hidden />
                    {inc.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {camp.logistics && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gabi-dark">Логистика</h3>
              <p className="text-sm text-slate-600 whitespace-pre-line">{camp.logistics}</p>
            </div>
          )}
          {program.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gabi-dark">Программа по дням</h3>
              <ul className="space-y-3">
                {program.map((day) => (
                  <li key={day.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <div className="text-sm font-semibold text-gabi-blue">День {day.day_number}</div>
                    <div className="text-base font-semibold text-gabi-dark">{day.title}</div>
                    <p className="text-sm text-slate-500">{day.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <div className="card-surface space-y-3">
            <h3 className="text-lg font-semibold text-gabi-dark">Присоединяйтесь</h3>
            <p className="text-sm text-slate-500">
              Оставьте контакты — организаторы свяжутся с подробностями о проживании, билетах и программе кэмпа.
            </p>
            <LeadCtaButton
              label="Записаться"
              className="btn-primary w-full"
              source={`camp-${camp.slug}`}
              initial={{ preferred_direction: camp.title, message: "Хочу узнать подробнее" }}
            />
            {camp.registration_link && (
              <a href={camp.registration_link} target="_blank" rel="noreferrer" className="btn-secondary w-full text-center">
                Перейти к регистрации
              </a>
            )}
          </div>
          {highlights.length > 0 && (
            <div className="card-surface space-y-3">
              <h3 className="text-lg font-semibold text-gabi-dark">Что вас ждёт</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {highlights.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-gabi-blue/80" aria-hidden />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {trainers.length > 0 && (
        <section className="space-y-6">
          <h2 className="section-title section-accent">Тренеры кэмпа</h2>
          <CoachShowcase coaches={trainers} showHeading={false} className="mt-6" />
        </section>
      )}

      {gallery.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gabi-dark">Галерея</h2>
          <CampGallery slug={camp.slug} title={camp.title} photos={gallery} />
        </section>
      )}
    </div>
  );
}
