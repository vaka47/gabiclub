import Link from "next/link";

import type { ClubProfile, ContactInfo } from "@/lib/types";

const footerLinks = [
  { href: "/trainings", label: "Тренировки" },
  { href: "/camps", label: "Кэмпы" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "О клубе" },
];

type FooterProps = {
  contact: ContactInfo;
  club?: ClubProfile;
  logoSrc?: string;
};

export default function Footer({ contact, club, logoSrc }: FooterProps) {
  const toTelHref = (val?: string | null) =>
    val ? `tel:${String(val).replace(/[^+\d]/g, "")}` : undefined;
  const toUrl = (val?: string | null, platform?: "telegram" | "instagram" | "whatsapp" | "vk" | "youtube") => {
    if (!val) return undefined;
    const v = String(val).trim();
    if (/^https?:\/\//i.test(v)) return v;
    if (platform === "telegram") return `https://t.me/${v.replace(/^@/, "")}`;
    if (platform === "instagram") return `https://instagram.com/${v.replace(/^@/, "")}`;
    if (platform === "vk") return `https://vk.com/${v.replace(/^@/, "")}`;
    if (platform === "whatsapp") return `https://wa.me/${v.replace(/[^\d]/g, "")}`;
    return v;
  };
  const resolvedLogo = logoSrc?.trim();
  return (
    <footer className="relative mt-16 border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-12 px-4 pb-12 pt-12 md:grid-cols-[2fr_1fr_1fr]">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            {resolvedLogo ? (
              <img src={resolvedLogo} alt="Gabi logo" className="h-16 w-auto" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded bg-gabi-blue/10 text-gabi-blue text-xl">G</div>
            )}
            <h3 className="text-2xl font-semibold uppercase text-gabi-blue">{club?.name ?? "GABI CLUB"}</h3>
          </div>
          <p className="max-w-md text-sm text-slate-600">
            {club?.mission ??
              "Тренировки для взрослых и детей. Индивидуальные планы, техника и комфортный сервис."}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Навигация</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-gabi-blue">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Мы на связи</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            {contact.phone_primary && (
              <li>
                <a href={toTelHref(contact.phone_primary)} className="transition hover:text-gabi-blue">
                  {contact.phone_primary}
                </a>
              </li>
            )}
            {contact.phone_secondary && (
              <li>
                <a href={toTelHref(contact.phone_secondary)} className="transition hover:text-gabi-blue">
                  {contact.phone_secondary}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="transition hover:text-gabi-blue">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.telegram && (
              <li>
                <a href={toUrl(contact.telegram, "telegram")} target="_blank" rel="noreferrer" className="transition hover:text-gabi-blue">
                  Telegram
                </a>
              </li>
            )}
            {contact.whatsapp && (
              <li>
                <a href={toUrl(contact.whatsapp, "whatsapp")} target="_blank" rel="noreferrer" className="transition hover:text-gabi-blue">
                  WhatsApp
                </a>
              </li>
            )}
            {contact.instagram && (
              <li>
                <a href={toUrl(contact.instagram, "instagram")} target="_blank" rel="noreferrer" className="transition hover:text-gabi-blue">
                  Instagram
                </a>
              </li>
            )}
            {contact.youtube && (
              <li>
                <a href={toUrl(contact.youtube, "youtube")} target="_blank" rel="noreferrer" className="transition hover:text-gabi-blue">
                  YouTube
                </a>
              </li>
            )}
            {contact.vk && (
              <li>
                <a href={toUrl(contact.vk, "vk")} target="_blank" rel="noreferrer" className="transition hover:text-gabi-blue">
                  VK
                </a>
              </li>
            )}
            {contact.social_links?.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer" className="transition hover:text-gabi-blue">
                  {link.title}
                </a>
              </li>
            ))}
            {contact.address && <li>{contact.address}</li>}
            {contact.working_hours && <li>{contact.working_hours}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} GABI CLUB. Все права защищены.</p>
          <p>Сайт собрал @Vaka47.</p>
          <p>С уважением к вашему времени и уровню сервиса.</p>
        </div>
      </div>
    </footer>
  );
}
