import { clsx } from "clsx";
import Link from "next/link";

import type { TrainingDirection } from "@/lib/types";

type TrainingDirectionsShowcaseProps = {
  directions: TrainingDirection[];
};

const getContainerClassName = (count: number) => {
  if (count === 1) {
    return "mx-auto grid max-w-3xl grid-cols-1 gap-6";
  }
  if (count === 2) {
    return "grid grid-cols-1 gap-6 md:grid-cols-2";
  }
  if (count >= 3 && count <= 5) {
    return "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6";
  }
  return "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3";
};

const getCardClassName = (count: number, index: number) => {
  if (count === 3) {
    return "lg:col-span-2";
  }
  if (count === 4) {
    return "lg:col-span-3";
  }
  if (count === 5) {
    if (index < 3) {
      return "lg:col-span-2";
    }
    if (index === 3) {
      return "lg:col-span-2 lg:col-start-2";
    }
    return "lg:col-span-2 lg:col-start-4";
  }
  return "";
};

export default function TrainingDirectionsShowcase({
  directions,
}: TrainingDirectionsShowcaseProps) {
  const activeDirections = directions.filter((direction) => direction.is_active !== false);

  if (activeDirections.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <h2 className="section-title section-accent">Направления тренировок</h2>
        <p className="section-subtitle">
          Выбирайте направление по сезону, цели и формату занятий. У каждого есть
          отдельная страница с тарифами, локациями и галереей.
        </p>
      </div>

      <div className={getContainerClassName(activeDirections.length)}>
        {activeDirections.map((direction, index) => {
          const href = `/trainings/${direction.slug}`;
          const hasImage = Boolean(direction.cover_image);

          return (
            <Link
              key={direction.id}
              href={href}
              className={clsx(
                "group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_85px_-35px_rgba(15,23,42,0.45)]",
                getCardClassName(activeDirections.length, index),
              )}
            >
              <div className="relative flex min-h-[320px] flex-col justify-between p-7 sm:p-8">
                {hasImage ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
                      style={{ backgroundImage: `url(${direction.cover_image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950/82 via-slate-900/58 to-gabi-blue/52" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(31,111,235,0.18),_transparent_42%),linear-gradient(135deg,_rgba(255,255,255,0.98),_rgba(243,247,255,0.95))]" />
                )}

                <div className="relative flex items-start justify-between gap-4">
                  <span
                    className={clsx(
                      "inline-flex min-h-[3rem] min-w-[3rem] items-center justify-center rounded-full border text-2xl shadow-sm",
                      hasImage
                        ? "border-white/25 bg-white/10 text-white backdrop-blur-sm"
                        : "border-gabi-blue/10 bg-white/85 text-gabi-blue",
                    )}
                  >
                    {direction.icon || "•"}
                  </span>
                  <span
                    className={clsx(
                      "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]",
                      hasImage
                        ? "bg-white/12 text-white/92 backdrop-blur-sm"
                        : "bg-gabi-blue/8 text-gabi-blue",
                    )}
                  >
                    Направление
                  </span>
                </div>

                <div className="relative space-y-4">
                  <div className="space-y-3">
                    <h3
                      className={clsx(
                        "max-w-[18rem] text-3xl font-semibold sm:text-4xl",
                        hasImage ? "text-white" : "text-gabi-dark",
                      )}
                    >
                      {direction.title}
                    </h3>
                    {direction.description && (
                      <p
                        className={clsx(
                          "max-w-[34rem] text-sm leading-6 sm:text-base",
                          hasImage ? "text-white/82" : "text-slate-600",
                        )}
                      >
                        {direction.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={clsx(
                      "inline-flex items-center gap-2 text-sm font-semibold",
                      hasImage ? "text-white" : "text-gabi-blue",
                    )}
                  >
                    <span>Открыть страницу направления</span>
                    <span aria-hidden>→</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
