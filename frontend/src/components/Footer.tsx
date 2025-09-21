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
};

export default function Footer({ contact, club }: FooterProps) {
  return (
    <footer className="relative mt-16 bg-gabi-dark text-slate-100">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-12 pt-20 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">{club?.name ?? "Gabi Club"}</h3>
          <p className="max-w-md text-sm text-slate-300">
            {club?.mission ??
              "Тренировки, кэмпы и приключения. Мы помогаем взрослым и детям влюбиться в снег и горы."}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            {contact.phone_primary && <span>{contact.phone_primary}</span>}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="hover:text-white">
                {contact.email}
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">Навигация</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {footerLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">Мы на связи</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {contact.social_links?.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer" className="hover:text-white">
                  {link.title}
                </a>
              </li>
            ))}
            {contact.address && <li>{contact.address}</li>}
            {contact.working_hours && <li>{contact.working_hours}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Gabi Club. Все права защищены.</p>
          <p>Сделано с любовью к снегу и приключениям.</p>
        </div>
      </div>
    </footer>
  );
}
