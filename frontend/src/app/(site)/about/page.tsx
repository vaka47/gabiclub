import LeadCtaButton from "@/components/LeadCtaButton";
import { getClubProfile, getCoaches, getContactInfo } from "@/lib/api";
import { FaInstagram, FaTelegramPlane, FaVk } from "react-icons/fa";

export default async function AboutPage() {
  const [club, contact, coaches] = await Promise.all([
    getClubProfile(),
    getContactInfo(),
    getCoaches(),
  ]);

  const coachCount = coaches.length;

  const toUrl = (val?: string | null, platform?: "instagram" | "telegram" | "vk") => {
    if (!val) return undefined;
    const v = String(val).trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (platform === "instagram") return `https://instagram.com/${v.replace(/^@/, "")}`;
    if (platform === "telegram") return `https://t.me/${v.replace(/^@/, "")}`;
    if (platform === "vk") return `https://vk.com/${v.replace(/^@/, "")}`;
    return v;
  };

  return (
    <div className="space-y-12 pb-12">
      <header className="space-y-4">
        <h1 className="section-title">О клубе</h1>
        <p className="section-subtitle">{club.story}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card-surface">
          <div className="text-3xl font-semibold text-gabi-blue">{club.founded_year ?? "2015"}</div>
          <p className="mt-2 text-sm text-slate-500">Год основания клуба. С тех пор мы провели десятки кэмпов и сотни тренировок.</p>
        </div>
        <div className="card-surface">
          <div className="text-3xl font-semibold text-gabi-blue">{coachCount}</div>
          <p className="mt-2 text-sm text-slate-500">Тренеров и методистов в команде Gabi Club.</p>
        </div>
        <div className="card-surface">
          <div className="text-3xl font-semibold text-gabi-blue">200+</div>
          <p className="mt-2 text-sm text-slate-500">Участников клуба в Москве, Санкт-Петербурге и на кэмпах.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gabi-dark">Миссия</h2>
        <p className="text-base text-slate-600">{club.mission}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface space-y-4">
          <h3 className="text-xl font-semibold text-gabi-dark">Контакты</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            {contact.address && (
              <li>
                <strong className="text-gabi-dark">Адрес:</strong> {contact.address}
              </li>
            )}
            {contact.phone_primary && (
              <li>
                <strong className="text-gabi-dark">Телефон:</strong> {contact.phone_primary}
              </li>
            )}
            {contact.email && (
              <li>
                <strong className="text-gabi-dark">Email:</strong> {contact.email}
              </li>
            )}
            {contact.working_hours && (
              <li>
                <strong className="text-gabi-dark">График:</strong> {contact.working_hours}
              </li>
            )}
          </ul>
          <LeadCtaButton label="Написать нам" className="btn-primary" source="about" />
        </div>
        <div className="card-surface space-y-3">
          <h3 className="text-xl font-semibold text-gabi-dark">Соцсети</h3>
          <div className="mt-10 flex items-center gap-6 text-3xl md:text-4xl text-slate-500">
            {contact.instagram && (
              <a
                href={toUrl(contact.instagram, "instagram")}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="transition hover:text-gabi-blue"
              >
                <FaInstagram />
              </a>
            )}
            {contact.telegram && (
              <a
                href={toUrl(contact.telegram, "telegram")}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                title="Telegram"
                className="transition hover:text-gabi-blue"
              >
                <FaTelegramPlane />
              </a>
            )}
            {contact.vk && (
              <a
                href={toUrl(contact.vk, "vk")}
                target="_blank"
                rel="noreferrer"
                aria-label="VK"
                title="VK"
                className="transition hover:text-gabi-blue"
              >
                <FaVk />
              </a>
            )}
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {contact.social_links?.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-gabi-blue">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
