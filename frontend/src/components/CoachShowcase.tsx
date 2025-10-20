"use client";

import Image from "next/image";

import type { Coach } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";
import { useLeadModal } from "./providers/LeadModalProvider";

function CoachAvatar({ coach }: { coach: Coach }) {
  const photoUrl = resolveMediaUrl(coach.photo ?? undefined);
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={coach.full_name}
        width={72}
        height={72}
        className="h-16 w-16 rounded-full object-cover shadow"
      />
    );
  }
  const initials = coach.full_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gabi-blue/90 text-lg font-semibold text-white shadow-glow">
      {initials}
    </div>
  );
}

type CoachShowcaseProps = {
  coaches: Coach[];
};

export default function CoachShowcase({ coaches }: CoachShowcaseProps) {
  const { openLeadModal } = useLeadModal();

  if (coaches.length === 0) return null;

  return (
    <section className="mt-20 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="section-title">Команда тренеров</h2>
        <p className="section-subtitle">Лыжники, трейлраннеры, методисты — мы подбираем тренера под вашу цель.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {coaches.map((coach) => (
          <div key={coach.id} className="card-surface flex h-full flex-col gap-4">
            <div className="flex items-center gap-4">
              <CoachAvatar coach={coach} />
              <div>
                <h3 className="text-lg font-semibold text-gabi-dark">{coach.full_name}</h3>
                {coach.role && <p className="text-sm text-slate-500">{coach.role}</p>}
              </div>
            </div>
            <p className="text-sm text-slate-600">{coach.bio}</p>
            {coach.directions.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-gabi-blue/80">
                {coach.directions.map((direction) => (
                  <span key={direction.id} className="rounded-full bg-gabi-blue/10 px-3 py-1">
                    {direction.title}
                  </span>
                ))}
              </div>
            )}
            <LeadCtaButton
              label="Связаться с тренером"
              className="btn-secondary mt-auto"
              source="coach"
              initial={{
                preferred_direction: coach.directions[0]?.title ?? coach.full_name,
                message: `Хочу тренироваться с ${coach.full_name}`,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
