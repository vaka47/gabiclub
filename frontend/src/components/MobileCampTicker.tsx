"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Camp } from "@/lib/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type MobileCampTickerProps = { camps?: Camp[] | null };

function formatDates(start?: string, end?: string) {
  if (!start || !end) return "";
  try {
    return `${format(new Date(start), "d MMM", { locale: ru })} – ${format(new Date(end), "d MMM", { locale: ru })}`;
  } catch {
    return "";
  }
}

export default function MobileCampTicker({ camps }: MobileCampTickerProps) {
  const pathname = usePathname();
  const list = (camps ?? []).filter(Boolean);
  if (list.length === 0) return null;
  if (pathname === "/camps") return null;
  // Если мы и так на странице одного из кэмпов — не показываем тикер
  if (pathname.startsWith("/camps/")) return null;

  const sorted = [...list].sort((a, b) => {
    const ta = a.start_date ? new Date(a.start_date).getTime() : 0;
    const tb = b.start_date ? new Date(b.start_date).getTime() : 0;
    return ta - tb;
  });

  const items = sorted
    .map((camp) => {
      const dates = formatDates(camp.start_date, camp.end_date);
      const text = `${dates} • ${camp.title}`.trim();
      return { camp, text };
    })
    .filter((x) => x.text.length > 0);

  if (items.length === 0) return null;

  return (
    <Link href="/camps" className="fixed inset-x-0 top-14 z-40 md:hidden" aria-label="Открыть страницу кэмпов">
      <div className="mobile-camp-ticker pointer-events-auto mt-4">
        <div className="marquee">
          {[...items, ...items].map(({ camp, text }, idx) => (
            <span key={`${camp.id}-${idx}`} className="marquee-item">
              {text}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
