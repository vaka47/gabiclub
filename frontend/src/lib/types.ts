export type LevelTag = {
  id: number;
  tag: string;
  name: string;
};

export type TrainingDirection = {
  id: number;
  title: string;
  description?: string;
  icon?: string;
};

export type Location = {
  id: number;
  title: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type Coach = {
  id: number;
  full_name: string;
  slug: string;
  role?: string;
  bio?: string;
  achievements?: string;
  experience_years?: number;
  photo?: string | null;
  instagram?: string;
  telegram?: string;
  phone?: string;
  email?: string;
  is_featured?: boolean;
  directions: TrainingDirection[];
};

export type TrainingPlanBenefit = {
  id: number;
  text: string;
  order?: number;
};

export type TrainingPlanCategory =
  | "personal"
  | "mini_group"
  | "athlete"
  | "kids";

export type TrainingPlan = {
  id: number;
  title: string;
  category: TrainingPlanCategory;
  category_display: string;
  description?: string;
  price: number;
  period: string;
  is_featured?: boolean;
  order?: number;
  benefits: TrainingPlanBenefit[];
};

export type TrainingSession = {
  id: number;
  title?: string;
  date: string;
  start_time: string;
  end_time: string;
  type: string;
  direction: TrainingDirection;
  coach: Coach | null;
  location: Location;
  levels: LevelTag[];
  intensity?: string;
  spots_total?: number;
  spots_available?: number;
  description?: string;
  registration_link?: string;
  color?: string;
  duration?: number;
  is_open?: boolean;
};

export type CampHighlight = {
  id: number;
  text: string;
};

export type CampDay = {
  id: number;
  day_number: number;
  title?: string;
  description?: string;
};

export type CampGalleryImage = {
  id: number;
  image: string;
  caption?: string;
};

export type Camp = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  description: string;
  start_date: string;
  end_date: string;
  price_from: number;
  location: string;
  hero_image?: string;
  registration_link?: string;
  status: string;
  status_display?: string;
  is_featured?: boolean;
};

export type CampDetail = Camp & {
  highlights: CampHighlight[];
  program: CampDay[];
  gallery: CampGalleryImage[];
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  published_at: string;
  updated_at?: string;
  reading_time?: number;
  tags: ArticleTag[];
  seo_title?: string;
  seo_description?: string;
  is_published?: boolean;
};

export type ArticleTag = {
  id: number;
  title: string;
  slug: string;
};

export type ContactInfo = {
  id: number;
  title: string;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  address?: string;
  map_url?: string;
  working_hours?: string;
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  youtube?: string;
  vk?: string;
  social_links?: SocialLink[];
};

export type SocialLink = {
  id: number;
  title: string;
  url: string;
  icon?: string;
  order?: number;
};

export type ClubProfile = {
  id: number;
  name: string;
  tagline?: string;
  mission?: string;
  story?: string;
  founded_year?: number;
  hero_video?: string;
  hero_description?: string;
  seo_title?: string;
  seo_description?: string;
  hero_slides: HeroSlide[];
};

export type HeroSlide = {
  id: number;
  title?: string;
  subtitle?: string;
  image?: string;
  order?: number;
};

export type LeadFormData = {
  full_name: string;
  email: string;
  phone: string;
  preferred_direction: string;
  message: string;
  source?: string;
};

export type LeadFormInitial = Partial<Pick<LeadFormData, "preferred_direction" | "message" | "source" | "full_name" | "email" | "phone">> & {
  contextTitle?: string;
};
