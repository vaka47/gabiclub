"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiPhoneCall, FiX } from "react-icons/fi";

import type { SocialLink } from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";

type HeaderProps = {
  contactPhone?: string;
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

export default function Header({ contactPhone, socialLinks }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openLeadModal } = useLeadModal();

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
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/70">
      <div className="text-xs text-slate-600 bg-slate-50/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 text-sm text-slate-500">
              <FiPhoneCall className="text-gabi-blue" />
              {contactPhone ?? "+7 (999) 200-30-30"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gabi-blue border border-slate-200">
              GABI CLUB
            </span>
          </div>
          <div className="hidden items-center gap-4 text-sm text-slate-500 md:flex">
            {socialLinks?.map((link) => (
              <a key={link.id ?? link.title} href={link.url} target="_blank" rel="noreferrer" className="hover:text-gabi-blue">
                {link.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold text-gabi-dark">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gabi-blue text-white shadow-glow">
            G
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-semibold uppercase tracking-[0.3em] text-gabi-blue">GABI</span>
            <span className="text-xs font-medium text-slate-500">SPORT CLUB</span>
          </div>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {renderLinks("desktop")}
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
          </div>
        </div>
      )}
    </header>
  );
}
