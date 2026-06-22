import { addDays, addMinutes, format, startOfWeek } from "date-fns";

import type {
  Article,
  ArticleTag,
  Camp,
  CampDetail,
  Coach,
  ClubProfile,
  ContactInfo,
  HeroSlide,
  LevelTag,
  Location,
  Product,
  SessionTariff,
  TrainingDirection,
  TrainingPlan,
  TrainingSession,
} from "./types";

const levelTags: LevelTag[] = [
  { id: 1, tag: "beginner", name: "Начальный" },
  { id: 2, tag: "intermediate", name: "Средний" },
  { id: 3, tag: "advanced", name: "Продвинутый" },
  { id: 4, tag: "any", name: "Любой" },
];

const directions: TrainingDirection[] = [
  {
    id: 1,
    title: "Беговые лыжи",
    description: "Скандинавский стиль и кросс-кантри тренировки на свежем воздухе.",
    icon: "🎿",
  },
  {
    id: 2,
    title: "Функциональный тренинг",
    description: "Силовые и кардио занятия для подготовки к сезонам.",
    icon: "🏋️",
  },
  {
    id: 3,
    title: "Горные походы",
    description: "Пешие и трейл активности для укрепления выносливости.",
    icon: "⛰️",
  },
  {
    id: 4,
    title: "Детская академия",
    description: "Игровой формат тренировок для юных спортсменов.",
    icon: "🧒",
  },
];

const locations: Location[] = [
  {
    id: 1,
    title: "Крылатские холмы",
    address: "Москва, парк Крылатские холмы",
    latitude: 55.757,
    longitude: 37.45,
  },
  {
    id: 2,
    title: "Манеж GABI",
    address: "Москва, ул. Спортивная, 12",
    latitude: 55.73,
    longitude: 37.6,
  },
  {
    id: 3,
    title: "Поляна Adventure",
    address: "Сочи, Роза Хутор",
  },
];

const coaches: Coach[] = [
  {
    id: 1,
    full_name: "Габриэлла Смирнова",
    slug: "gabriella-smirnova",
    role: "Основатель клуба",
    bio: "Мастер спорта международного класса по лыжным гонкам.",
    achievements: "Участница Кубка мира, призёр чемпионатов России.",
    experience_years: 12,
    instagram: "gabi.coach",
    telegram: "gabi_club",
    phone: "+7 930 934-13-95",
    directions: [directions[0], directions[1]],
    is_featured: true,
  },
  {
    id: 2,
    full_name: "Илья Морозов",
    slug: "ilya-morozov",
    role: "Старший тренер",
    bio: "Специалист по функциональной подготовке и силовой выносливости.",
    achievements: "Подготовил 8 мастеров спорта.",
    experience_years: 9,
    instagram: "coach.morozov",
    directions: [directions[1], directions[2]],
    is_featured: true,
  },
  {
    id: 3,
    full_name: "Анна Орлова",
    slug: "anna-orlova",
    role: "Координатор детских программ",
    bio: "Педагог и тренер по лыжам для детей 6-12 лет.",
    experience_years: 7,
    instagram: "orlova.kids",
    directions: [directions[3]],
    is_featured: true,
  },
];

const planBenefits = (items: string[]): TrainingPlan["benefits"] =>
  items.map((text, idx) => ({ id: idx + 1, text }));

const plans: TrainingPlan[] = [
  {
    id: 1,
    title: "Индивидуальный PRO",
    slug: "individualnyy-pro",
    category: "personal",
    category_display: "Индивидуальные outdoor",
    description: "Персональные занятия с выездом на вашу локацию",
    price: 7500,
    period: "за тренировку",
    is_featured: true,
    order: 1,
    benefits: planBenefits([
      "Диагностика техники",
      "Индивидуальный план прогресса",
      "Видеометрика и разбор",
    ]),
    photos: [],
  },
  {
    id: 2,
    title: "Мини-группа Race",
    slug: "mini-gruppa-race",
    category: "mini_group",
    category_display: "Мини-группы",
    description: "До 6 человек в группе с фокусом на технику",
    price: 3800,
    period: "за тренировку",
    order: 1,
    benefits: planBenefits([
      "Разделение по уровню",
      "Индивидуальные корректировки",
      "Доступ к онлайн-библиотеке",
    ]),
    photos: [],
  },
  {
    id: 3,
    title: "Team Elite",
    slug: "team-elite",
    category: "athlete",
    category_display: "Группы для спортсменов",
    description: "Подготовка к стартам и гонкам",
    price: 14500,
    period: "в месяц",
    order: 1,
    benefits: planBenefits([
      "4 тренировки в неделю",
      "Консультации по питанию",
      "Сборы и контрольные старты",
    ]),
    photos: [],
  },
  {
    id: 4,
    title: "Kids Play",
    slug: "kids-play",
    category: "kids",
    category_display: "Группы для детей",
    description: "Игровые тренировки и адаптация к снегу",
    price: 9200,
    period: "в месяц",
    order: 1,
    benefits: planBenefits([
      "Две тренировки в неделю",
      "Тьютор для родителей",
      "Мероприятия клуба",
    ]),
    photos: [],
  },
  {
    id: 5,
    title: "Outdoor Focus",
    slug: "outdoor-focus",
    category: "personal",
    category_display: "Индивидуальные outdoor",
    description: "Сессия 90 минут на природе",
    price: 9500,
    period: "за тренировку",
    order: 2,
    benefits: planBenefits([
      "Подбор экипировки",
      "Анализ данных часов",
      "Рекомендации по восстановлению",
    ]),
    photos: [],
  },
];

const sessionTariffs: SessionTariff[] = [
  {
    id: 1,
    title: "Индивидуальная тренировка",
    slug: "individualnaya-trenirovka",
    category: "personal",
    category_display: "Индивидуальные",
    description: "Самый эффективный вид занятий для достижения ваших целей.",
    is_featured: true,
    order: 1,
    prices: [
      { id: 11, label: "Тренировка с Габриеллой Калугер", price: 3800, order: 1 },
      { id: 12, label: "Тренировка с Андреем Красновым", price: 4500, order: 2 },
    ],
    benefits: [],
    photos: [],
  },
  {
    id: 5,
    title: "Парная тренировка",
    slug: "parnaya-trenirovka",
    category: "personal",
    category_display: "Индивидуальные",
    description: "Тренировка для двух человек. Взаимная поддержка - залог результата.",
    order: 2,
    prices: [
      { id: 13, label: "Парная тренировка с Габриеллой Калугер", price: 5500, order: 1 },
      { id: 14, label: "Парная тренировка с Андреем Красновым", price: 6500, order: 2 },
    ],
    benefits: [],
    photos: [],
  },
  {
    id: 2,
    title: "Групповая тренировка",
    slug: "gruppovaya-trenirovka",
    category: "group",
    category_display: "Групповые",
    description: "Деление по уровню подготовки, поддержка команды.",
    order: 3,
    prices: [
      { id: 21, label: "Разовое участие", price: 1500, order: 1 },
      { id: 22, label: "Группа PRO + анализ лактата", price: 1600, order: 2 },
    ],
    benefits: [],
    photos: [],
  },
  {
    id: 3,
    title: "Абонемент на месяц в группу начинающих",
    slug: "abonement-na-mesyac-v-gruppu-nachinayushih",
    category: "subscription",
    category_display: "Абонементы",
    description: "Каждый месяц вы выбираете количество групповых занятий.",
    order: 4,
    prices: [
      { id: 31, label: "4 занятия", price: 4800, order: 1 },
      { id: 32, label: "6 занятий", price: 6600, order: 2 },
      { id: 33, label: "8 занятий", price: 8000, order: 3 },
    ],
    benefits: [],
    photos: [],
  },
  {
    id: 4,
    title: "Бесплатный прокат инвентаря",
    slug: "besplatnyy-prokat-inventarya",
    category: "service",
    category_display: "Сервисы",
    description: "Соберём комплект экипировки на первую тренировку.",
    order: 5,
    prices: [{ id: 41, label: "Прокат на первом занятии", price: 0, order: 1 }],
    benefits: [],
    photos: [],
  },
];

const products: Product[] = [
  {
    id: 1,
    name: "Race Shell Jacket",
    slug: "race-shell-jacket",
    description:
      "Лёгкая куртка для прохладных стартов и межсезонных тренировок: защищает от ветра, не перегревает и сохраняет спортивную посадку.",
    price: 12990,
    sale_price: 9990,
    current_price: 9990,
    has_discount: true,
    cta_mode: "order",
    cta_label: "Заказать",
    size_chart_note: "Рекомендуем обычный размер: посадка спортивная, ближе к телу.",
    order: 1,
    images: [
      { id: 11, image: "/main-1.jpg", caption: "Главный ракурс", order: 1 },
      { id: 12, image: "/hero-1.jpg", caption: "Посадка", order: 2 },
      { id: 13, image: "/hero-2.jpg", caption: "Деталь ткани", order: 3 },
    ],
    sizes: [
      { id: 101, label: "S", details: "84-90 см по груди", order: 1 },
      { id: 102, label: "M", details: "90-96 см по груди", order: 2 },
      { id: 103, label: "L", details: "96-102 см по груди", order: 3 },
    ],
  },
  {
    id: 2,
    name: "Club Gilet",
    slug: "club-gilet",
    description:
      "Минималистичный жилет для разминки и длинных аэробных сессий: утеплённый фронт, чистый силуэт и эластичная спинка.",
    price: 8990,
    sale_price: null,
    current_price: 8990,
    has_discount: false,
    cta_mode: "availability",
    cta_label: "Узнать о наличии",
    size_chart_note: "Если планируете носить поверх толстого слоя, берите на размер больше.",
    order: 2,
    images: [
      { id: 21, image: "/main-2.jpg", caption: "Вид спереди", order: 1 },
      { id: 22, image: "/gabigroup-main.jpg", caption: "На спортсмене", order: 2 },
      { id: 23, image: "/hero-2-min.jpg", caption: "Деталь спины", order: 3 },
    ],
    sizes: [
      { id: 201, label: "XS", details: "80-84 см по груди", order: 1 },
      { id: 202, label: "S", details: "84-90 см по груди", order: 2 },
      { id: 203, label: "M", details: "90-96 см по груди", order: 3 },
    ],
  },
  {
    id: 3,
    name: "Trail Cap",
    slug: "trail-cap",
    description:
      "Лёгкая беговая кепка с дышащей сеткой и гибким козырьком для летних сборов, роллеров и трейла.",
    price: 3490,
    sale_price: 2790,
    current_price: 2790,
    has_discount: true,
    cta_mode: "order",
    cta_label: "Заказать",
    size_chart_note: "Единый размер с регулировкой по объёму головы.",
    order: 3,
    images: [
      { id: 31, image: "/main-3.jpg", caption: "Общий вид", order: 1 },
      { id: 32, image: "/hero-1-min.jpg", caption: "В движении", order: 2 },
    ],
    sizes: [{ id: 301, label: "One size", details: "54-60 см", order: 1 }],
  },
];

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Фото 1",
    image: "/gabigroup-main.jpg",
    order: 1,
  },
  {
    id: 2,
    title: "Фото 2",
    image: "/hero-1-min.jpg",
    order: 2,
  },
  {
    id: 3,
    title: "Фото 3",
    image: "/hero-2-min.jpg",
    order: 3,
  },
];

const clubProfile: ClubProfile = {
  id: 1,
  name: "Gabi Club",
  tagline: "Клуб для тех, кто выбирает результат",
  mission:
    "Мы объединяем взрослых и детей, которые любят движение, зиму и командный дух. Наши тренировки — это путь к уверенности на трассе и за её пределами.",
  story:
    "Gabi Club появился как проект спортсменов-супругов. Сегодня мы тренируем более 200 участников в Санкт-Петербурге и организуем кэмпы по всей России.",
  founded_year: 2022,
  hero_description:
    "Лыжи, роллеры и бег под руководством Габриеллы Калугер и Андрея Краснова.",
  hero_slides: heroSlides,
};

const contactInfo: ContactInfo = {
  id: 1,
  title: "Gabi Club",
  phone_primary: "+7 (930) 934-13-95",
  phone_secondary: "+7 (930) 934-13-95",
  email: "hello@gabi.club",
  address: "Москва, Спортивная 12, манеж GABI",
  map_url: "https://yandex.ru/maps/?um=constructor%3Agabi",
  working_hours: "Ежедневно 07:00 – 22:00",
  whatsapp: "https://wa.me/89151949527",
  telegram: "https://t.me/gabi_club",
  instagram: "https://instagram.com/gabi.club",
  youtube: "https://youtube.com/@gabi.club",
  social_links: [
    { id: 1, title: "Instagram", url: "https://instagram.com/gabi.club", icon: "instagram" },
    { id: 2, title: "Telegram", url: "https://t.me/gabi_club", icon: "telegram" },
    { id: 3, title: "YouTube", url: "https://youtube.com/@gabi.club", icon: "youtube" },
  ],
};

const createSession = (
  id: number,
  dayOffset: number,
  startHour: number,
  durationMinutes: number,
  directionIdx: number,
  coachIdx: number,
  locationIdx: number,
  type: string,
  levelIds: number[],
  title: string,
  intensity: string,
  color: string,
): TrainingSession => {
  const base = startOfWeek(new Date(), { weekStartsOn: 1 });
  const sessionDate = addDays(base, dayOffset);
  const startDateTime = new Date(sessionDate);
  startDateTime.setHours(startHour, 0, 0, 0);
  const endDateTime = addMinutes(startDateTime, durationMinutes);
  const dateStr = format(sessionDate, "yyyy-MM-dd");
  const levels = levelIds
    .map((lvlId) => levelTags.find((lvl) => lvl.id === lvlId)!)
    .filter(Boolean);
  const spotsAvailable = Math.max(0, 12 - (id % 5) * 2);

  return {
    id,
    title,
    date: dateStr,
    start_time: format(startDateTime, "HH:mm"),
    end_time: format(endDateTime, "HH:mm"),
    duration: durationMinutes,
    type,
    direction: directions[directionIdx],
    coach: coaches[coachIdx] ?? null,
    location: locations[locationIdx],
    levels,
    intensity,
    spots_total: 12,
    spots_available: spotsAvailable,
    description: `${title} с акцентом на ${directions[directionIdx].title.toLowerCase()}.`,
    registration_link: "https://forms.gle/gabiclub",
    color,
    is_open: spotsAvailable > 0,
  };
};

function createSchedule(): TrainingSession[] {
  return [
    createSession(1, 0, 7, 75, 0, 0, 0, "group", [1, 2], "Утро на лыжах", "Средний", "#006CFF"),
    createSession(2, 0, 19, 90, 1, 1, 1, "group", [2, 3], "Силовая подготовка", "Высокая", "#FF2D2D"),
    createSession(3, 1, 6, 60, 0, 0, 0, "open", [4], "Техника классики", "Средний", "#10B981"),
    createSession(4, 1, 18, 75, 3, 2, 1, "group", [1], "Kids Snow", "Низкая", "#F97316"),
    createSession(5, 2, 20, 90, 2, 1, 2, "mini_group", [2, 3], "Trail Night", "Высокая", "#6366F1"),
    createSession(6, 3, 7, 60, 0, 0, 0, "group", [1, 2], "Классика + силовая", "Средний", "#0EA5E9"),
    createSession(7, 4, 10, 120, 2, 1, 2, "open", [3], "Горный сбор", "Высокая", "#DC2626"),
    createSession(8, 5, 11, 60, 3, 2, 1, "group", [1], "Kids Adventure", "Средний", "#F59E0B"),
  ];
}

const campsDetail: CampDetail[] = [];

const camps: Camp[] = [];

const tags: ArticleTag[] = [
  { id: 1, title: "Подготовка", slug: "preseason" },
  { id: 2, title: "Экипировка", slug: "gear" },
  { id: 3, title: "Дети", slug: "kids" },
];

const articles: Article[] = [
  {
    id: 1,
    title: "5 шагов к идеальной лыжной технике",
    slug: "perfect-ski-technique",
    excerpt:
      "Работа с балансом, силой и контролем дыхания — база любого спортсмена.",
    content:
      "<p><strong>Разминка и мобилизация</strong> — ключ к стабильной технике. Не пропускайте динамические связки перед выходом на снег.</p><p>Фокусируйтесь на положении корпуса и работе рук. Записывайте тренировки на видео и анализируйте их вместе с тренером.</p>",
    cover_image:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=1200&q=80",
    published_at: "2024-12-10T10:00:00Z",
    reading_time: 6,
    tags: [tags[0], tags[1]],
    seo_title: "Лыжная техника: пять шагов",
    seo_description: "Руководство по улучшению техники для любителей и спортсменов.",
    is_published: true,
  },
  {
    id: 2,
    title: "Как подготовить ребёнка к первому снежному сезону",
    slug: "kids-first-season",
    excerpt:
      "Дети быстрее влюбляются в спорт, если первый опыт связан с играми и приключениями.",
    content:
      "<p>Покажите ребёнку, что лыжи — это весело. Играйте, ставьте простые цели, устраивайте мини-соревнования внутри семьи.</p><p>Не забывайте про безопасность и защиту: шлем, тёплые слои и горячий чай после тренировки.</p>",
    cover_image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    published_at: "2025-01-05T09:00:00Z",
    reading_time: 5,
    tags: [tags[2]],
    is_published: true,
  },
];

export const mockData = {
  levelTags,
  directions,
  locations,
  coaches,
  plans,
  sessionTariffs,
  products,
  sessions: createSchedule(),
  camps,
  campsDetail,
  contactInfo,
  clubProfile,
  articles,
  tags,
};

export const getMockSessions = () => createSchedule();
export const getMockPlans = () => plans;
export const getMockSessionTariffs = () => sessionTariffs;
export const getMockCoaches = () => coaches;
export const getMockProducts = () => products;
export const getMockDirections = () => directions;
export const getMockLevels = () => levelTags;
export const getMockLocations = () => locations;
export const getMockCamps = () => camps;
export const getMockCampBySlug = (slug: string) =>
  campsDetail.find((camp) => camp.slug === slug);
export const getMockArticles = () => articles;
export const getMockArticleBySlug = (slug: string) =>
  articles.find((article) => article.slug === slug);
export const getMockTags = () => tags;
export const getMockContactInfo = () => contactInfo;
export const getMockClubProfile = () => clubProfile;
export const getMockHeroSlides = () => heroSlides;
