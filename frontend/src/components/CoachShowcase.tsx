"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";

import type { Coach } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import LeadCtaButton from "./LeadCtaButton";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import CoachModal from "./CoachModal";
import DebugImage from "./DebugImage";

type CoachAvatarShape = "rect" | "circle";

function CoachAvatar({ coach, shape }: { coach: Coach; shape: CoachAvatarShape }) {
  const photoUrl = resolveMediaUrl(coach.photo ?? undefined);
  const avatarFrameClassName =
    shape === "circle" ? "h-20 w-20 rounded-full" : "h-24 w-[4.75rem] rounded-[1.35rem]";
  const avatarWidth = shape === "circle" ? 80 : 76;
  const avatarHeight = shape === "circle" ? 80 : 96;

  if (photoUrl) {
    return (
      <DebugImage
        debugName={`coach-avatar:${coach.id}`}
        src={photoUrl}
        alt={coach.full_name}
        width={avatarWidth}
        height={avatarHeight}
        className={clsx("shrink-0 object-cover shadow", avatarFrameClassName)}
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
    <div
      className={clsx(
        "flex shrink-0 items-center justify-center bg-gabi-blue/90 text-white shadow-glow",
        shape === "circle" ? "text-xl font-semibold" : "text-[1.55rem] font-bold",
        avatarFrameClassName,
      )}
    >
      {initials}
    </div>
  );
}

type CoachShowcaseProps = {
  coaches: Coach[];
  showHeading?: boolean;
  className?: string;
  avatarShape?: CoachAvatarShape;
  desktopAlign?: "center" | "start";
};

export default function CoachShowcase({
  coaches,
  showHeading = true,
  className = "",
  avatarShape = "rect",
  desktopAlign = "center",
}: CoachShowcaseProps) {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const openCoachDetails = (coach: Coach) => setSelectedCoach(coach);
  const hasThreeColumnLayout = coaches.length >= 3;
  const desktopBlockWidthClassName = hasThreeColumnLayout ? "md:w-[760px] xl:w-[1128px]" : "md:w-[760px]";
  const desktopBlockAlignClassName =
    desktopAlign === "start" ? "md:ml-0 md:mr-auto" : "md:mx-auto";

  if (process.env.NODE_ENV !== "production") {
    console.log("[CoachShowcase] layout debug", {
      cards: coaches.length,
    });
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || typeof window === "undefined") return;
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const parent = gridEl.parentElement;
    if (!parent) return;
    const parentBox = parent.getBoundingClientRect();
    const gridBox = gridEl.getBoundingClientRect();
    const parentStyles = window.getComputedStyle(parent);
    const gridStyles = window.getComputedStyle(gridEl);
    console.log("[CoachShowcase] center diagnostics", {
      cards: coaches.length,
      parentWidth: Math.round(parentBox.width),
      gridWidth: Math.round(gridBox.width),
      parentJustify: parentStyles.justifyContent,
      gridDisplay: gridStyles.display,
      gridInline: gridStyles.display.includes("inline"),
      gridAutoWidth: gridStyles.width,
      expectedOffset: Math.round((parentBox.width - gridBox.width) / 2),
    });
  }, [coaches.length]);

  if (coaches.length === 0) return null;

  const getCoachHighlight = (coach: Coach) => {
    const achievements = coach.achievements?.trim();
    if (achievements) return { label: "Регалии", text: achievements };
    if (coach.experience_years) {
      return {
        label: "Опыт",
        text: `${coach.experience_years} ${coach.experience_years === 1 ? "год" : coach.experience_years < 5 ? "года" : "лет"} в тренировочной практике.`,
      };
    }
    return null;
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, coach: Coach) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openCoachDetails(coach);
  };

  return (
    <motion.section
      className={"mt-20 space-y-8 px-4 md:px-0 "+className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div
        className={clsx(
          "space-y-8 md:max-w-full",
          desktopBlockWidthClassName,
          desktopBlockAlignClassName,
        )}
      >
        {showHeading && (
          <div className="flex flex-col gap-2 text-left md:items-center md:text-center">
            <h2 className="section-title section-accent coach-title">Команда тренеров</h2>
            <p className="section-subtitle md:mx-auto">Мы подбираем тренера под вашу цель.</p>
          </div>
        )}
        <motion.div
          ref={gridRef}
          className={clsx(
            "grid w-full gap-6 md:grid-cols-[repeat(2,360px)] md:gap-x-10 md:gap-y-8",
            hasThreeColumnLayout && "xl:grid-cols-[repeat(3,360px)] xl:gap-x-12",
          )}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {coaches.map((coach) => {
            const highlight = getCoachHighlight(coach);

            return (
              <motion.article
                key={coach.id}
                className="card-surface flex h-full w-full max-w-[420px] cursor-pointer flex-col gap-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_-30px_rgba(15,23,42,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gabi-blue/45 focus-visible:ring-offset-2 md:min-h-[420px] md:w-[360px]"
                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                role="button"
                tabIndex={0}
                aria-label={`Открыть профиль тренера ${coach.full_name}`}
                onClick={() => openCoachDetails(coach)}
                onKeyDown={(event) => handleCardKeyDown(event, coach)}
              >
                <div className="flex items-center gap-4 text-left">
                  <CoachAvatar coach={coach} shape={avatarShape} />
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-gabi-dark underline-offset-4 hover:underline md:text-[1.35rem]">{coach.full_name}</h3>
                    {coach.role && <p className="text-sm text-slate-500 md:text-[0.95rem]">{coach.role}</p>}
                  </div>
                </div>
                {highlight && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gabi-blue/80">
                      {highlight.label}
                    </div>
                    <p className="text-sm leading-6 text-slate-700 md:text-[0.95rem]">
                      {highlight.text}
                    </p>
                  </div>
                )}
                {coach.bio && <p className="text-sm leading-6 text-slate-600 md:text-[0.95rem]">{coach.bio}</p>}
                {coach.directions.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {coach.directions.map((direction) => (
                      <span key={direction.id} className="brand-chip px-3 py-1">
                        {direction.title}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto" onClick={(event) => event.stopPropagation()}>
                  <LeadCtaButton
                    label="Связаться с тренером"
                    className="btn-secondary w-full"
                    source="coach"
                    initial={{
                      preferred_direction: coach.directions[0]?.title ?? coach.full_name,
                      message: `Хочу тренироваться с ${coach.full_name}`,
                    }}
                  />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
      <CoachModal open={!!selectedCoach} coach={selectedCoach} onClose={() => setSelectedCoach(null)} />
    </motion.section>
  );
}
