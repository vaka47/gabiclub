"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Coach } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";
import { FaInstagram, FaTelegramPlane } from "react-icons/fa";

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
  const toUrl = (val?: string | null, type?: "instagram" | "telegram") => {
    if (!val) return undefined;
    const v = val.trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (type === "instagram") return `https://instagram.com/${v.replace(/^@/, "")}`;
    if (type === "telegram") return `https://t.me/${v.replace(/^@/, "")}`;
    return v;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative mx-4 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-slate-700 hover:bg-black/20"
          aria-label="Закрыть"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left: vertical photo (desktop only) */}
          <div className="relative hidden bg-slate-100 md:block md:h-[520px] md:w-[42%]">
            {photo ? <Image src={photo} alt={coach.full_name} fill className="object-cover" /> : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">Нет фото</div>
            )}
          </div>

          {/* Right: info */}
          <div className="flex-1 space-y-4 p-6">
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
                  preferred_direction: coach.directions?.[0]?.title ?? coach.full_name,
                  message: `Хочу тренироваться с ${coach.full_name}`,
                }}
              />
            </div>

            {(coach.instagram || coach.telegram) && (
              <div className="flex flex-wrap gap-4 pt-1">
                {coach.instagram && (
                  <a
                    href={toUrl(coach.instagram, "instagram")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-gabi-blue hover:underline"
                  >
                    <FaInstagram /> Instagram
                  </a>
                )}
                {coach.telegram && (
                  <a
                    href={toUrl(coach.telegram, "telegram")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-gabi-blue hover:underline"
                  >
                    <FaTelegramPlane /> Telegram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
