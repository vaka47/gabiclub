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
  },
  {
    id: 2,
    title: "Мини-группа Race",
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
  },
  {
    id: 3,
    title: "Team Elite",
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
  },
  {
    id: 4,
    title: "Kids Play",
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
  },
  {
    id: 5,
    title: "Outdoor Focus",
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
  },
];

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Зимние сборы в Архызе",
    subtitle: "Снег, высота и команда мечты",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80",
    order: 1,
  },
  {
    id: 2,
    title: "Летний трейл-кэмп",
    subtitle: "Бежим по самым живописным тропам Кавказа",
    image:
      "https://images.unsplash.com/photo-1526481280695-3c4697e2ed83?auto=format&fit=crop&w=1400&q=80",
    order: 2,
  },
  {
    id: 3,
    title: "Семейные выходные",
    subtitle: "Активности для родителей и детей",
    image:
      "https://images.unsplash.com/photo-1516571137133-1be29e37143b?auto=format&fit=crop&w=1400&q=80",
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
    "Академия лыж, трейла и силы в Санкт-Петербурге. Вместе с первой тренировки до финиша марафона.",
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
  whatsapp: "https://wa.me/79309341395",
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

const campsDetail: CampDetail[] = [
  {
    id: 1,
    title: "Архыз Snow Camp",
    slug: "arhyz-snow-camp",
    summary: "Неделя на высоте 2000м: катание, техника, восстановление",
    description:
      "Полный погружение в снежный сезон: тренировки дважды в день, лекции по питанию и мастер-классы по настройке инвентаря.",
    start_date: "2025-02-10",
    end_date: "2025-02-17",
    price_from: 68500,
    location: "Архыз, Карачаево-Черкесия",
    hero_image:
      "https://images.unsplash.com/photo-1515516969-d4008cc6241a?auto=format&fit=crop&w=1400&q=80",
    registration_link: "https://gabiclub.ru/camps/arhyz",
    status: "upcoming",
    status_display: "Анонс",
    is_featured: true,
    highlights: [
      { id: 1, text: "Проживание в шале с видом на Кавказ" },
      { id: 2, text: "Ски-пасы и трансферы включены" },
      { id: 3, text: "Видеосъёмка и разбор техники" },
    ],
    program: [
      {
        id: 1,
        day_number: 1,
        title: "Знакомство и тестирование",
        description: "Легкий прокат, замеры техники, вечерняя баня",
      },
      {
        id: 2,
        day_number: 2,
        title: "Сила и баланс",
        description: "Утренний бег по склонам, вечерняя функциональная сессия",
      },
    ],
    gallery: [
      {
        id: 1,
        image:
          "https://images.unsplash.com/photo-1516569422865-0b911f27ffc9?auto=format&fit=crop&w=1200&q=80",
        caption: "Утренняя зарядка на склоне",
      },
      {
        id: 2,
        image:
          "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1200&q=80",
        caption: "Вечерняя дискуссия о питании",
      },
    ],
  },
  {
    id: 2,
    title: "Trail Sochi Camp",
    slug: "trail-sochi-camp",
    summary: "Подготовка к летнему трейлу",
    description:
      "Восхождения, силовые блоки и восстановление у моря. Программа для опытных бегунов.",
    start_date: "2024-09-05",
    end_date: "2024-09-10",
    price_from: 45500,
    location: "Сочи, Красная Поляна",
    hero_image:
      "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1400&q=80",
    registration_link: "https://gabiclub.ru/camps/trail",
    status: "completed",
    status_display: "Проведён",
    is_featured: false,
    highlights: [
      { id: 4, text: "Три горных восхождения" },
      { id: 5, text: "Лекции по трейл экипировке" },
    ],
    program: [
      {
        id: 3,
        day_number: 1,
        title: "Адаптация",
        description: "Легкий кросс + мобилизация",
      },
      {
        id: 4,
        day_number: 2,
        title: "Трейл 20км",
        description: "Восхождение на пик Черная",
      },
    ],
    gallery: [
      {
        id: 3,
        image:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
        caption: "Команда на тропе",
      },
    ],
  },
];

const camps: Camp[] = campsDetail.map((camp) => ({
  id: camp.id,
  title: camp.title,
  slug: camp.slug,
  summary: camp.summary,
  description: camp.description,
  start_date: camp.start_date,
  end_date: camp.end_date,
  price_from: camp.price_from,
  location: camp.location,
  hero_image: camp.hero_image,
  registration_link: camp.registration_link,
  status: camp.status,
  status_display: camp.status_display,
  is_featured: camp.is_featured,
}));

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
export const getMockCoaches = () => coaches;
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
