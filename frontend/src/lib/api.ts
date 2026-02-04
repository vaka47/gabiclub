import { mockData } from "./mockData";
import {
  Article,
  ArticleTag,
  Camp,
  CampDetail,
  Coach,
  ClubProfile,
  ContactInfo,
  LeadFormData,
  LevelTag,
  Location,
  ThemeConfig,
  TrainingDirection,
  TrainingPlan,
  TrainingSession,
  SessionTariff,
} from "./types";

// When the env is missing (e.g., preview/prod deployment forgot to set it),
// fall back to the public API host so schedule data is still fetched.
const PROD_FALLBACK_API = "https://api.gabiclub.ru/api";
const rawEnvApiBase = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
const preferApiBase =
  rawEnvApiBase || (process.env.NODE_ENV === "production" ? PROD_FALLBACK_API : "");

const API_BASE = (() => {
  if (!preferApiBase) {
    return "";
  }
  const sanitized = preferApiBase.replace(/\/$/, "");
  // If the value is an absolute origin without a path (e.g. https://api.domain.tld),
  // normalize it to point to the Django /api root so schedule/other endpoints resolve.
  if (/^https?:\/\//i.test(sanitized)) {
    try {
      const parsed = new URL(sanitized);
      if (!parsed.pathname || parsed.pathname === "/") {
        parsed.pathname = "/api";
        return parsed.toString().replace(/\/$/, "");
      }
      return sanitized;
    } catch {
      return sanitized;
    }
  }
  return sanitized || "/api";
})();

const API_TIMEOUT_MS = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_TIMEOUT_MS ??
    process.env.API_TIMEOUT_MS ??
    "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
})();

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const SKIP_API_AT_BUILD = process.env.SKIP_API_AT_BUILD === "1";
const hasApi = Boolean(API_BASE) && !(IS_BUILD && SKIP_API_AT_BUILD);
const DEBUG_API_FETCH =
  process.env.NEXT_PUBLIC_DEBUG_API_FETCH === "1" || process.env.DEBUG_API_FETCH === "1";

// Extract origin (scheme+host+port) from API base to resolve media URLs like 
// "/media/..." coming from Django. Example: https://api.gabiclub.ru/api -> https://api.gabiclub.ru
const API_ORIGIN = (() => {
  try {
    return API_BASE ? new URL(API_BASE).origin : "";
  } catch {
    return "";
  }
})();
const PROD_FALLBACK_ORIGIN = (() => {
  try {
    return new URL(PROD_FALLBACK_API).origin;
  } catch {
    return "";
  }
})();
const MEDIA_ORIGIN = (process.env.NEXT_PUBLIC_MEDIA_ORIGIN?.trim() || "") || API_ORIGIN || PROD_FALLBACK_ORIGIN;

const DEBUG_MEDIA = process.env.NEXT_PUBLIC_DEBUG_MEDIA === "1";

let cachedContactInfo: ContactInfo | null = null;
let cachedClubProfile: ClubProfile | null = null;

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ensureArray = <T>(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const normalizeCamp = <T extends Camp>(camp: T): T => ({
  ...camp,
  price_from: toNumber(camp.price_from, 0),
});

const normalizeCampDetail = (camp: CampDetail): CampDetail => ({
  ...normalizeCamp(camp),
  highlights: ensureArray(camp.highlights),
  inclusions: ensureArray(camp.inclusions),
  program: ensureArray(camp.program),
  gallery: ensureArray(camp.gallery),
  trainers: ensureArray(camp.trainers),
});

export function resolveMediaUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) {
    if (DEBUG_MEDIA && /\/media\//.test(src)) {
      // Server logs (and client logs if compiled to client) to trace original absolute media URLs
      console.log(`[media] absolute URL used as-is`, { in: src });
    }
    return src;
  }
  if (src.startsWith("/")) {
    // Only prefix absolute API-origin for media paths coming from Django.
    // Site-root assets like "/hero-1.jpg" must stay on the Next.js host.
    if (src.startsWith("/media/") || src.startsWith("/static/")) {
      const out = MEDIA_ORIGIN ? `${MEDIA_ORIGIN}${src}` : src;
      if (DEBUG_MEDIA) {
        console.log(`[media] resolved Django media`, { in: src, media_origin: MEDIA_ORIGIN, api_origin: API_ORIGIN, out });
      }
      return out;
    }
    return src;
  }
  return src;
}

type TrainingMeta = {
  directions: TrainingDirection[];
  locations: Location[];
  levels: LevelTag[];
  coaches: Coach[];
};

async function fetchFromApi<T>(endpoint: string, init?: RequestInit): Promise<T | null> {
  if (!hasApi) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api] API calls skipped: NEXT_PUBLIC_API_URL not set or disabled", {
        endpoint,
        apiBase: API_BASE,
        isBuild: IS_BUILD,
        skipAtBuild: SKIP_API_AT_BUILD,
      });
    }
    return null;
  }
  const url = `${API_BASE}${endpoint}`;
  if (DEBUG_API_FETCH) {
    console.log(`[api] ${init?.method ?? "GET"} ${url}`);
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
        next: { revalidate: 60 },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
    // Gracefully handle non-OK and empty responses (e.g., 204 No Content)
    if (response.status === 204) {
      return null;
    }
    if (!response.ok) {
      console.warn(`API ${endpoint} responded with ${response.status}`);
      return null;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text) as T;
      } catch {
        console.warn(`API ${endpoint} returned non-JSON content-type: ${contentType}`);
        return null;
      }
    }
    const json = await response.json();
    // Normalize DRF pagination: when a list endpoint is paginated, it returns
    // { count, next, previous, results: [...] }. We return the array to callers
    // that expect lists; single-object endpoints are returned as-is.
    const normalized =
      json && typeof json === "object" && "results" in json && Array.isArray((json as any).results)
        ? (json as any).results
        : json;
    return normalized as T;
  } catch (error) {
    console.warn(`API request to ${endpoint} failed`, error);
    return null;
  }
}

export async function getTrainingSessions(params?: URLSearchParams): Promise<TrainingSession[]> {
  const query = params ? `?${params.toString()}` : "";
  let data = await fetchFromApi<TrainingSession[]>(`/trainings/schedule/${query}`);
  if (!data) {
    // Fallback to a lightweight endpoint that avoids heavy nested fields
    // and is robust to missing media files.
    data = await fetchFromApi<TrainingSession[]>(`/trainings/schedule-simple/${query}`);
  }
  if (!data) {
    console.warn("[api] schedule: empty after primary and fallback endpoints", { query });
  }
  return data ?? [];
}

export async function getTrainingPlans(category?: string): Promise<TrainingPlan[]> {
  const query = category ? `?category=${category}` : "";
  const data = await fetchFromApi<TrainingPlan[]>(`/trainings/plans/${query}`);
  const plans = data ?? mockData.plans;
  return plans.map((plan) => ({
    ...plan,
    price: typeof plan.price === "string" ? Number(plan.price) : plan.price,
  }));
}

export async function getSessionTariffs(category?: string): Promise<SessionTariff[]> {
  const query = category ? `?category=${category}` : "";
  const data = await fetchFromApi<SessionTariff[]>(`/trainings/session-tariffs/${query}`);
  const tariffs = (data && Array.isArray(data) && data.length > 0) ? data : mockData.sessionTariffs;
  return tariffs.map((tariff) => ({
    ...tariff,
    prices: (tariff.prices ?? []).map((option) => ({
      ...option,
      price: typeof option.price === "string" ? Number(option.price) : option.price,
    })),
  }));
}

export async function getTrainingMeta(): Promise<TrainingMeta> {
  const data = await fetchFromApi<TrainingMeta>(`/trainings/meta/`);
  return (
    data ?? {
      directions: mockData.directions,
      locations: mockData.locations,
      levels: mockData.levelTags,
      coaches: mockData.coaches,
    }
  );
}

export async function getCoaches(): Promise<Coach[]> {
  const data = await fetchFromApi<Coach[]>(`/trainings/coaches/`);
  return data ?? mockData.coaches;
}

export async function getCamps(params?: URLSearchParams): Promise<Camp[]> {
  const query = params ? `?${params.toString()}` : "";
  const data = await fetchFromApi<Camp[]>(`/camps/${query}`);
  return (data ?? []).map((camp) => normalizeCamp(camp));
}

export async function getCampBySlug(slug: string): Promise<CampDetail | null> {
  const data = await fetchFromApi<CampDetail>(`/camps/${slug}/`);
  return data ? normalizeCampDetail(data) : null;
}

export async function getArticles(tagOrParams?: string | URLSearchParams): Promise<Article[]> {
  let query = "";
  if (typeof tagOrParams === "string" && tagOrParams) {
    query = `?tags__slug=${tagOrParams}`;
  } else if (tagOrParams instanceof URLSearchParams) {
    const s = tagOrParams.toString();
    query = s ? `?${s}` : "";
  }
  const data = await fetchFromApi<Article[]>(`/blog/articles/${query}`);
  return data ?? mockData.articles;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const data = await fetchFromApi<Article>(`/blog/articles/${slug}/`);
  return data ?? mockData.articles.find((article) => article.slug === slug) ?? null;
}

export async function getTags(): Promise<ArticleTag[]> {
  const data = await fetchFromApi<ArticleTag[]>(`/blog/tags/`);
  return data ?? mockData.tags;
}

export async function getContactInfo(): Promise<ContactInfo> {
  const data = await fetchFromApi<ContactInfo>(`/core/contact/`);
  if (data) {
    cachedContactInfo = data;
    return data;
  }
  return cachedContactInfo ?? mockData.contactInfo;
}

export async function getClubProfile(): Promise<ClubProfile> {
  const data = await fetchFromApi<ClubProfile>(`/core/club/`);
  if (data) {
    cachedClubProfile = data;
    return data;
  }
  return cachedClubProfile ?? mockData.clubProfile;
}

export async function getTheme(): Promise<ThemeConfig | null> {
  const data = await fetchFromApi<ThemeConfig>(`/core/theme/`);
  return data ?? null;
}

export async function submitLead(data: LeadFormData): Promise<string> {
  const payload = {
    ...data,
    source: data.source ?? "web",
  };

  if (hasApi) {
    const response = await fetchFromApi<{ message?: string }>(`/core/lead/`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (response?.message) {
      return response.message;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 800));
  return "Заявка отправлена. Мы свяжемся с вами в ближайшее время.";
}
