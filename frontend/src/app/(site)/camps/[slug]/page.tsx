import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import LeadCtaButton from "@/components/LeadCtaButton";
import { getCampBySlug, getCamps, resolveMediaUrl } from "@/lib/api";

function formatDate(date: string) {
  return format(new Date(date), "d MMMM yyyy", { locale: ru });
}

export async function generateStaticParams() {
  const camps = await getCamps();
  return camps.map((camp) => ({ slug: camp.slug }));
}

export default async function CampDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const camp = await getCampBySlug(slug);
  if (!camp) {
    notFound();
  }
  const price = Number(camp.price_from);

  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-6">
        <div className="relative h-[360px] overflow-hidden rounded-[32px]">
          {camp.hero_image ? (
            <Image src={resolveMediaUrl(camp.hero_image) ?? camp.hero_image} alt={camp.title} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center bg-gabi-blue/10 text-2xl font-semibold text-gabi-blue">
              {camp.title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 px-8 py-10 text-white">
            <span className="badge bg-white/20 text-white">{camp.status_display ?? camp.status}</span>
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
        <div className="space-y-6 text-slate-600">
          <h2 className="section-title text-2xl">О кэмпе</h2>
          <p className="text-base leading-relaxed">{camp.description}</p>
          {camp.program.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gabi-dark">Программа по дням</h3>
              <ul className="space-y-3">
                {camp.program.map((day) => (
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
          {camp.highlights.length > 0 && (
            <div className="card-surface space-y-3">
              <h3 className="text-lg font-semibold text-gabi-dark">Что вас ждёт</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {camp.highlights.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-gabi-blue" aria-hidden />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card-surface space-y-3">
            <h3 className="text-lg font-semibold text-gabi-dark">Присоединяйтесь</h3>
            <p className="text-sm text-slate-500">
              Оставьте контакты — организаторы свяжутся с подробностями, подбором проживания и билетов.
            </p>
            <LeadCtaButton label="Записаться" className="btn-primary w-full" source={`camp-${camp.slug}`} />
            {camp.registration_link && (
              <a href={camp.registration_link} target="_blank" rel="noreferrer" className="btn-secondary w-full text-center">
                Перейти к регистрации
              </a>
            )}
          </div>
        </aside>
      </section>

      {camp.gallery.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gabi-dark">Галерея</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {camp.gallery.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-3xl">
                <Image src={resolveMediaUrl(photo.image) ?? photo.image} alt={photo.caption ?? camp.title} width={640} height={420} className="h-full w-full object-cover" />
                {photo.caption && <figcaption className="px-2 py-2 text-xs text-slate-500">{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
