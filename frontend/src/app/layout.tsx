import "../styles/globals.css";
import "../styles/halenoir.css";

import type { Metadata } from "next";
import { Russo_One, Inter } from "next/font/google";

import CursorTrail from "@/components/CursorTrail";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadModalProvider from "@/components/providers/LeadModalProvider";
import { getClubProfile, getContactInfo, getTheme, resolveMediaUrl } from "@/lib/api";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
// Use Russo One for display headings (supports Cyrillic, strong geometric look)
const bebas = Russo_One({ weight: "400", subsets: ["latin", "cyrillic"], variable: "--font-bebas" });
const siteIcon = process.env.NEXT_PUBLIC_LOGO || "/gabi-logo.png";

export const metadata: Metadata = {
  title: "Gabi Club — тренировки, кэмпы и блог",
  description:
    "Современный спортивный клуб с календарём тренировок, авторскими кэмпами и блогом о лыжах и трейле.",
  icons: {
    icon: siteIcon,
    shortcut: siteIcon,
    apple: siteIcon,
  },
};

const DEFAULT_BG_COLOR = "#E9E9E9";

function colorWithAlpha(color: string | null | undefined, alpha: number): string {
  const fallback = `rgba(233, 233, 233, ${alpha})`;
  if (!color) return fallback;
  const value = color.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expandHex = (segment: string) => (segment.length === 1 ? segment.repeat(2) : segment);

    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(expandHex(hex[0]), 16);
      const g = parseInt(expandHex(hex[1]), 16);
      const b = parseInt(expandHex(hex[2]), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  const rgbMatch = value.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch?.[1]) {
    const channels = rgbMatch[1]
      .split(",")
      .map((part) => parseFloat(part.trim()))
      .filter((value) => !Number.isNaN(value))
      .slice(0, 3);
    if (channels.length === 3) {
      const [r, g, b] = channels;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }

  return fallback;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, club, theme] = await Promise.all([getContactInfo(), getClubProfile(), getTheme()]);
  const envSnowBg = process.env.NEXT_PUBLIC_SNOW_BG;
  const snowBg = resolveMediaUrl(envSnowBg) || resolveMediaUrl(theme?.snow_bg);
  const brandBg = theme?.background_color || DEFAULT_BG_COLOR;
  const overlayBg = colorWithAlpha(brandBg, 0.6);
  const shellBg = snowBg ? "transparent" : brandBg;
  const themeVars: React.CSSProperties = {
    ["--brand-primary" as any]: theme?.primary_color || "#1A5ACB",
    ["--brand-secondary" as any]: theme?.secondary_color || "#FF6A00",
    ["--brand-grad-start" as any]: theme?.gradient_start || "#1A5ACB",
    ["--brand-grad-end" as any]: theme?.gradient_end || "#FF6A00",
    ["--brand-bg" as any]: brandBg,
  };

  return (
    <html lang="ru">
      <body className={`${inter.variable} ${bebas.variable} min-h-screen text-gabi-gray`} style={themeVars}>
        {/* Site-wide subtle snow background */}
        {snowBg && (
          <div className="fixed inset-0 -z-10">
            <div
              className="absolute inset-0 bg-cover bg-top"
              style={{ backgroundImage: `url(${snowBg})` }}
              aria-hidden
            />
            <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: overlayBg }} aria-hidden />
          </div>
        )}
        <div style={{ backgroundColor: shellBg }}>
          <LeadModalProvider>
            <CursorTrail />
            <Header contactPhone={contact.phone_primary} socialLinks={contact.social_links} />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-40 pb-20 md:px-6 lg:px-8">
              {children}
            </main>
            <Footer contact={contact} club={club} />
          </LeadModalProvider>
        </div>
      </body>
    </html>
  );
}
