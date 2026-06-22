import type { SessionTariff, TrainingPlan } from "./types";

type Sluggable = {
  id: number;
  title: string;
  slug?: string | null;
};

export function fallbackTariffSlug(item: Sluggable, fallbackPrefix = "tariff") {
  const normalized =
    item.slug?.trim() ||
    item.title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "");

  return normalized || `${fallbackPrefix}-${item.id}`;
}

export function getTrainingPlanHref(plan: Pick<TrainingPlan, "id" | "slug" | "title">) {
  return `/pricing/training-plans/${fallbackTariffSlug(plan, "training-plan")}`;
}

export function getSessionTariffHref(
  tariff: Pick<SessionTariff, "id" | "slug" | "title">,
) {
  return `/pricing/session-tariffs/${fallbackTariffSlug(
    tariff,
    "session-tariff",
  )}`;
}
