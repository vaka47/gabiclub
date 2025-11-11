"use client";

import Link from "next/link";
import type { Camp } from "@/lib/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type MobileCampTickerProps = { camp?: Camp | null };

function formatDates(start?: string, end?: string) {
  if (!start || !end) return "";
  try {
    return `${format(new Date(start), "d MMM", { locale: ru })} – ${format(new Date(end), "d MMM", { locale: ru })}`;
  } catch {
    return "";
  }
}

export default function MobileCampTicker({ camp }: MobileCampTickerProps) {
  if (!camp) return null;
  const dates = formatDates(camp.start_date, camp.end_date);
  const text = `${dates} • ${camp.title}`.trim();

  return (
    <Link
      href={`/camps/${camp.slug}`}
      className="fixed inset-x-0 top-14 z-40 md:hidden"
      aria-label={`Открыть страницу кэмпа ${camp.title}`}
    >
      <div className="mobile-camp-ticker pointer-events-auto mt-4">
        <div className="marquee">
          <span className="marquee-item">{text}</span>
          <span className="marquee-item" aria-hidden>
            {text}
          </span>
        </div>
      </div>
    </Link>
  );
}

