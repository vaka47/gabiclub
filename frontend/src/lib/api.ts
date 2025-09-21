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
  TrainingDirection,
  TrainingPlan,
  TrainingSession,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const hasApi = Boolean(API_BASE);

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
    if (!response.ok) {
      console.warn(`API ${endpoint} responded with ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
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
