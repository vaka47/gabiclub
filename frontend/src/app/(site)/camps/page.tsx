import Image from "next/image";
import DebugImage from "@/components/DebugImage";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import LeadCtaButton from "@/components/LeadCtaButton";
import { resolveMediaUrl } from "@/lib/api";
import { getCamps } from "@/lib/api";
import type { Camp } from "@/lib/types";

function formatCampDates(camp: Camp) {
  const start = format(new Date(camp.start_date), "d MMM", { locale: ru });
  const end = format(new Date(camp.end_date), "d MMM", { locale: ru });
  return `${start} — ${end}`;
}

function CampCard({ camp }: { camp: Camp }) {
  const price = Number(camp.price_from);
  const preferred = camp.header_image || camp.hero_image;
  const img = preferred ? (resolveMediaUrl(preferred) ?? preferred) : null;
  if (process.env.NEXT_PUBLIC_DEBUG_MEDIA === '1') {
    console.log('[media] camp card hero', { slug: camp.slug, raw: preferred, resolved: img });
  }
  return (
    <article className="card-surface flex h-full flex-col overflow-hidden">
      <div className="relative h-52 w-full overflow-hidden rounded-2xl">
        {img ? (
          <DebugImage debugName={`camp-card:${camp.slug}`} src={img} alt={camp.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gabi-blue/20 text-lg font-semibold text-gabi-blue">
            {camp.location}
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gabi-blue">
          {camp.status_display ?? camp.status}
        </span>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gabi-dark">{camp.title}</h3>
          <p className="text-sm text-slate-500">{camp.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-gabi-blue">{formatCampDates(camp)}</span>
          <span>{camp.location}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gabi-dark">
          <span className="text-lg font-semibold text-gabi-blue">от {price.toLocaleString("ru-RU")} ₽</span>
          <Link href={`/camps/${camp.slug}`} className="btn-secondary">
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function CampsPage() {
  const camps = await getCamps();
  const upcoming = camps.filter((camp) => camp.status !== "completed");
  const past = camps.filter((camp) => camp.status === "completed");

  return (
    <div className="space-y-16 pb-12">
      <header className="space-y-4">
        <h1 className="section-title">Кэмпы Gabi Club</h1>
        <p className="section-subtitle">
          Авторские спортивные путешествия: снег и горы, лыжи и трейлы, спорт и приключения. Выбирайте анонсы или вдохновляйтесь прошедшими выездами.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gabi-dark">Ближайшие кэмпы</h2>
          <LeadCtaButton
            label="Оставить заявку"
            className="btn-primary"
            source="camps-list"
            initial={{ preferred_direction: "Кэмпы", message: "Расскажите мне о предстоящих кэмпах" }}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {upcoming.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
          {upcoming.length === 0 && (
            <p className="text-sm text-slate-500">Скоро добавим новые поездки.</p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gabi-dark">Прошедшие кэмпы</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {past.map((camp) => (
            <CampCard key={camp.id} camp={camp} />
          ))}
          {past.length === 0 && <p className="text-sm text-slate-500">Пока нет завершённых кэмпов.</p>}
        </div>
      </section>
    </div>
  );
}
