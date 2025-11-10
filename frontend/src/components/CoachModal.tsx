"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Coach } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";

type CoachModalProps = {
  open: boolean;
  coach: Coach | null;
  onClose: () => void;
};

export default function CoachModal({ open, coach, onClose }: CoachModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !coach) return null;

  const photo = resolveMediaUrl(coach.photo ?? undefined);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative mx-4 w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-slate-700 hover:bg-black/20"
          aria-label="Закрыть"
        >
          ✕
        </button>

        {photo && (
          <div className="relative h-40 w-full overflow-hidden">
            <Image src={photo} alt={coach.full_name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        <div className="space-y-4 p-6">
          <h3 className="section-title section-accent text-2xl">{coach.full_name}</h3>
          {coach.role && <div className="text-sm text-slate-500">{coach.role}</div>}

          {coach.bio && (
            <div>
              <div className="text-sm font-semibold text-gabi-dark">Биография</div>
              <p className="whitespace-pre-line text-sm text-slate-600">{coach.bio}</p>
            </div>
          )}

          {coach.achievements && (
            <div>
              <div className="text-sm font-semibold text-gabi-dark">Регалии</div>
              <p className="whitespace-pre-line text-sm text-slate-600">{coach.achievements}</p>
            </div>
          )}

          {coach.directions?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {coach.directions.map((d) => (
                <span key={d.id} className="brand-chip px-3 py-1 text-xs">{d.title}</span>
              ))}
            </div>
          )}

          <div className="pt-2">
            <LeadCtaButton
              label="Записаться"
              className="btn-primary w-full"
              source="coach-modal"
              initial={{
                preferred_direction: coach.directions[0]?.title ?? coach.full_name,
                message: `Хочу тренироваться с ${coach.full_name}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

