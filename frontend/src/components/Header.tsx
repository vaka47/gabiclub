"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { FaInstagram, FaPhoneAlt, FaTelegramPlane, FaVk } from "react-icons/fa";

import type { ContactInfo, SocialLink } from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";

type HeaderProps = {
  contact?: ContactInfo;
  socialLinks?: SocialLink[];
  logoSrc?: string;
};

type NavLink = {
  href: string;
  label: string;
};

const desktopLinks: NavLink[] = [
  { href: "/trainings", label: "Тренировки" },
  { href: "/pricing", label: "Тарифы" },
  { href: "/camps", label: "Кэмпы" },
  { href: "/shop", label: "Магазин" },
];

const aboutMenuLinks: NavLink[] = [
  { href: "/about", label: "О нас" },
  { href: "/blog", label: "Блог" },
];

const mobileLinks: NavLink[] = [
  { href: "/trainings", label: "Тренировки" },
  { href: "/pricing", label: "Тарифы" },
  { href: "/camps", label: "Кэмпы" },
  { href: "/shop", label: "Магазин" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "О клубе" },
];

const resolveSocialIcon = (title: string) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("telegram")) return FaTelegramPlane;
  if (normalizedTitle.includes("instagram")) return FaInstagram;
  if (normalizedTitle.includes("vk")) return FaVk;

  return null;
};

const toTelHref = (value?: string | null) =>
  value ? `tel:${String(value).replace(/[^+\d]/g, "")}` : undefined;

export default function Header({ contact, socialLinks, logoSrc }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openLeadModal } = useLeadModal();
  const resolvedLogo = logoSrc?.trim();
  const phoneNumber = contact?.phone_primary ?? contact?.phone_secondary;
  const phoneHref = toTelHref(phoneNumber);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);
  const isPathActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isClubMenuActive = isPathActive("/about") || isPathActive("/blog");

  const renderDesktopLinks = () => (
    <nav className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
      {desktopLinks.map((link) => {
        const isActive = isPathActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "text-lg font-medium transition md:text-sm",
              isActive ? "text-gabi-blue" : "text-slate-600 hover:text-gabi-blue",
            )}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="group relative">
        <button
          type="button"
          className={clsx(
            "inline-flex items-center gap-1 text-lg font-medium transition md:text-sm",
            isClubMenuActive ? "text-gabi-blue" : "text-slate-600 hover:text-gabi-blue group-hover:text-gabi-blue",
          )}
          aria-haspopup="true"
        >
          О клубе
          <FiChevronDown
            size={14}
            className="transition duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
          />
        </button>
        <div className="pointer-events-none absolute left-0 top-full z-20 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          <div className="min-w-[11rem] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)]">
            {aboutMenuLinks.map((link) => {
              const isActive = isPathActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "block rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive ? "bg-gabi-blue/10 text-gabi-blue" : "text-slate-600 hover:bg-slate-50 hover:text-gabi-blue",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderMobileLinks = () => (
    <nav className="flex flex-col gap-6">
      {mobileLinks.map((link) => {
        const isActive = isPathActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={clsx(
              "text-lg font-medium transition",
              isActive ? "text-gabi-blue" : "text-slate-600 hover:text-gabi-blue",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  const renderSocialLinks = (mode: "desktop" | "mobile") => (
    <>
      {mode === "mobile" && phoneHref && (
        <a
          href={phoneHref}
          className="shrink-0 text-slate-500 transition hover:text-gabi-blue"
          aria-label={`Позвонить: ${phoneNumber}`}
        >
          <FaPhoneAlt size={16} />
        </a>
      )}
      {socialLinks?.map((link) => {
        const Icon = resolveSocialIcon(link.title || "");
        if (!Icon) return null;

        return (
          <a
            key={link.id ?? link.title}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className={clsx("shrink-0 text-slate-500 transition hover:text-gabi-blue", {
              "text-slate-500": mode === "desktop",
            })}
            aria-label={link.title}
          >
            <Icon size={mode === "desktop" ? 18 : 16} />
          </a>
        );
      })}
    </>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 md:py-5">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold text-gabi-dark">
          {resolvedLogo ? (
            <img src={resolvedLogo} alt="Gabi logo" className="h-10 w-auto" />
          ) : (
            <div className="h-10 w-auto flex items-center text-gabi-blue">G</div>
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold uppercase tracking-[0.05em] text-gabi-blue">G A B I</span>
            <span className="text-xs font-medium text-slate-500">SPORT CLUB</span>
          </div>
        </Link>

        {/* Center: desktop social icons */}
        <div className="hidden items-center justify-center gap-8 md:flex">
          {phoneHref && (
            <a
              href={phoneHref}
              className="whitespace-nowrap text-sm font-medium text-slate-600 transition hover:text-gabi-blue"
              aria-label={`Позвонить: ${phoneNumber}`}
            >
              {phoneNumber}
            </a>
          )}
          {renderSocialLinks("desktop")}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {renderDesktopLinks()}
          <button
            className="btn-primary"
            onClick={() => openLeadModal({ source: "header" })}
            type="button"
          >
            Записаться
          </button>
        </div>

        {/* Mobile social icons to the left of burger */}
        <div className="mr-2 flex shrink-0 items-center gap-6 md:hidden">
          {renderSocialLinks("mobile")}
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
            {renderMobileLinks()}
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
            {/* Соцсети в мобильном меню не показываем — иконки уже в хедере */}
          </div>
        </div>
      )}
    </header>
  );
}
