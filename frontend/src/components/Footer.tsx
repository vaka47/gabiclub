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
    <footer className="relative mt-16 border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-12 pt-12 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-gabi-blue">{club?.name ?? "Gabi Club"}</h3>
          <p className="max-w-md text-sm text-slate-600">
            {club?.mission ??
              "Тренировки для взрослых и детей. Индивидуальные планы, техника и комфортный сервис."}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {contact.phone_primary && <span>{contact.phone_primary}</span>}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="hover:text-gabi-blue">
                {contact.email}
              </a>
            )}
          </div>
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
          <p>© {new Date().getFullYear()} Gabi Club. Все права защищены.</p>
          <p>С уважением к вашему времени и уровню сервиса.</p>
        </div>
      </div>
    </footer>
  );
}
