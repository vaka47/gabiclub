"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import type { Coach } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";
import { useLeadModal } from "./providers/LeadModalProvider";
import { useState } from "react";
import CoachModal from "./CoachModal";

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
  showHeading?: boolean;
  className?: string;
};

export default function CoachShowcase({ coaches, showHeading = true, className = "" }: CoachShowcaseProps) {
  const { openLeadModal } = useLeadModal();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  if (coaches.length === 0) return null;

  return (
    <motion.section
      className={"mt-20 space-y-8 px-4 md:px-0 "+className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div className="space-y-8 md:mx-auto md:max-w-6xl">
        {showHeading && (
          <div className="flex flex-col gap-2 md:items-center md:text-center">
            <h2 className="section-title section-accent coach-title">Команда тренеров</h2>
            <p className="section-subtitle">Мы подбираем тренера под вашу цель.</p>
          </div>
        )}
      <motion.div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:justify-center md:justify-items-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {coaches.map((coach) => (
          <motion.div
            key={coach.id}
            className="card-surface flex h-full flex-col gap-4"
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <button type="button" className="flex items-center gap-4 text-left" onClick={() => setSelectedCoach(coach)}>
              <CoachAvatar coach={coach} />
              <div>
                <h3 className="text-lg font-semibold text-gabi-dark underline-offset-4 hover:underline">{coach.full_name}</h3>
                {coach.role && <p className="text-sm text-slate-500">{coach.role}</p>}
              </div>
            </button>
            <p className="text-sm text-slate-600">{coach.bio}</p>
            {coach.directions.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {coach.directions.map((direction) => (
                  <span key={direction.id} className="brand-chip px-3 py-1">
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
          </motion.div>
        ))}
      </motion.div>
      </div>
      <CoachModal open={!!selectedCoach} coach={selectedCoach} onClose={() => setSelectedCoach(null)} />
    </motion.section>
  );
}
