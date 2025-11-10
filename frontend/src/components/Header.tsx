"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

import type { SocialLink } from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";

type HeaderProps = {
  socialLinks?: SocialLink[];
};

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: "/trainings", label: "Тренировки" },
  { href: "/camps", label: "Кэмпы" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "О клубе" },
];

export default function Header({ socialLinks }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openLeadModal } = useLeadModal();
  const logoSrc = process.env.NEXT_PUBLIC_LOGO?.trim() || undefined;

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const renderLinks = (mode: "desktop" | "mobile") => (
    <nav
      className={clsx("flex flex-col gap-6", {
        "md:flex-row md:items-center md:gap-10": mode === "desktop",
      })}
    >
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={clsx(
              "text-lg font-medium transition md:text-sm",
              isActive ? "text-gabi-blue" : "text-slate-600 hover:text-gabi-blue",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold text-gabi-dark">
          {logoSrc ? (
            <img src={logoSrc} alt="Gabi logo" className="h-10 w-auto" />
          ) : (
            <div className="h-10 w-auto flex items-center text-gabi-blue">G</div>
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold uppercase tracking-[0.05em] text-gabi-blue">G A B I</span>
            <span className="text-xs font-medium text-slate-500">SPORT CLUB</span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {renderLinks("desktop")}
          {socialLinks?.length ? (
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {socialLinks.map((link) => (
                <a
                  key={link.id ?? link.title}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-gabi-blue"
                >
                  {link.title}
                </a>
              ))}
            </div>
          ) : null}
          <button
            className="btn-primary"
            onClick={() => openLeadModal({ source: "header" })}
            type="button"
          >
            Записаться
          </button>
        </div>

        <button
          onClick={toggleMenu}
          className="flex items-center justify-center rounded-full border border-slate-200 p-2 text-gabi-dark shadow-sm transition hover:border-gabi-blue hover:text-gabi-blue md:hidden"
          aria-label="Открыть меню"
          type="button"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden">
          <div className="mx-4 mb-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-xl">
            {renderLinks("mobile")}
            <button
              className="btn-primary mt-6 w-full"
              onClick={() => {
                openLeadModal({ source: "header-mobile" });
                closeMenu();
              }}
              type="button"
            >
              Записаться на тренировку
            </button>
            {socialLinks?.length ? (
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
                {socialLinks.map((link) => (
                  <a
                    key={link.id ?? link.title}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-gabi-blue"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
