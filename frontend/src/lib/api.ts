import { getMockCampBySlug, getMockSessions, mockData } from "./mockData";
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
} from "./types";

// Use absolute API base URL only if provided.
// During static build on Vercel, relative URLs like "/api" are invalid for Node fetch.
// If not provided, we skip network calls and fall back to local mocks.
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const SKIP_API_AT_BUILD = process.env.SKIP_API_AT_BUILD === "1";
const hasApi = Boolean(API_BASE) && !(IS_BUILD && SKIP_API_AT_BUILD);

// Extract origin (scheme+host+port) from API base to resolve media URLs like 
// "/media/..." coming from Django. Example: https://api.gabiclub.ru/api -> https://api.gabiclub.ru
const API_ORIGIN = (() => {
  try {
    return API_BASE ? new URL(API_BASE).origin : "";
  } catch {
    return "";
  }
})();

export function resolveMediaUrl(src?: string | null): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/")) {
    // Only prefix absolute API-origin for media paths coming from Django.
    // Site-root assets like "/hero-1.jpg" must stay on the Next.js host.
    if (src.startsWith("/media/") || src.startsWith("/static/")) {
      return API_ORIGIN ? `${API_ORIGIN}${src}` : src;
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
  if (!hasApi) return null;
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      next: { revalidate: 60 },
    });
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
  const data = await fetchFromApi<TrainingSession[]>(`/trainings/schedule/${query}`);
  return data ?? getMockSessions();
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
  return data ?? mockData.camps;
}

export async function getCampBySlug(slug: string): Promise<CampDetail | null> {
  const data = await fetchFromApi<CampDetail>(`/camps/${slug}/`);
  return data ?? getMockCampBySlug(slug) ?? null;
}

export async function getArticles(tag?: string): Promise<Article[]> {
  const query = tag ? `?tags__slug=${tag}` : "";
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
  return data ?? mockData.contactInfo;
}

export async function getClubProfile(): Promise<ClubProfile> {
  const data = await fetchFromApi<ClubProfile>(`/core/club/`);
  return data ?? mockData.clubProfile;
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
