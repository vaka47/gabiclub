import "../styles/globals.css";
import "../styles/halenoir.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { Metadata } from "next";
import { Russo_One, Inter } from "next/font/google";

import CursorTrail from "@/components/CursorTrail";
import Footer from "@/components/Footer";
import MobileCampTicker from "@/components/MobileCampTicker";
import Header from "@/components/Header";
import LeadModalProvider from "@/components/providers/LeadModalProvider";
import NetworkDebugProbe from "@/components/NetworkDebugProbe";
import { getClubProfile, getContactInfo, getTheme, getCamps, resolveMediaUrl } from "@/lib/api";
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
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, club, theme, featuredCamps] = await Promise.all([
    getContactInfo(),
    getClubProfile(),
    getTheme(),
    getCamps(new URLSearchParams("is_featured=1")),
  ]);
  const envLogo = process.env.NEXT_PUBLIC_LOGO?.trim() || "";
  const themedLogo = theme?.club_photo ? resolveMediaUrl(theme.club_photo) : "";
  const logoSrc = envLogo || themedLogo || "/gabi-logo.png";
  const brandBg = theme?.background_color || DEFAULT_BG_COLOR;
  const themeVars: React.CSSProperties = {
    ["--brand-primary" as any]: theme?.primary_color || "#1A5ACB",
    ["--brand-secondary" as any]: theme?.secondary_color || "#FF6A00",
    ["--brand-grad-start" as any]: theme?.gradient_start || "#1A5ACB",
    ["--brand-grad-end" as any]: theme?.gradient_end || "#FF6A00",
    ["--brand-bg" as any]: brandBg,
  };
  // Build header social links from contact block; add basic ones if missing
  const baseLinks = contact.social_links ?? [];
  const ensure = (title: string, url?: string) =>
    url ? ({ id: `${title.toLowerCase()}-auto`, title, url }) : null;
  const extras = [
    ensure("Telegram", contact.telegram),
    ensure("Instagram", contact.instagram),
    ensure("VK", contact.vk),
  ].filter(Boolean) as any[];
  const names = new Set(baseLinks.map((l) => (l.title || "").toLowerCase()));
  const headerLinks = baseLinks.slice();
  extras.forEach((e) => {
    if (!names.has((e.title || "").toLowerCase())) headerLinks.push(e as any);
  });

  return (
    <html lang="ru">
      <body className={`${inter.variable} ${bebas.variable} min-h-screen text-gabi-gray`} style={themeVars}>
        <div className="fixed inset-0 -z-10 sky-gradient-layer" aria-hidden />
        <div className="relative min-h-screen">
          <LeadModalProvider>
            {process.env.NEXT_PUBLIC_DEBUG_NETWORK === "1" && <NetworkDebugProbe />}
            <CursorTrail />
            <Header socialLinks={headerLinks} logoSrc={logoSrc} />
            {/* Mobile-only camp ticker overlay across the site */}
            <MobileCampTicker camps={featuredCamps ?? []} />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 md:pt-40 pb-20 md:px-6 lg:px-8">
              {children}
            </main>
            <Footer contact={contact} club={club} logoSrc={logoSrc} />
          </LeadModalProvider>
        </div>
      </body>
    </html>
  );
}
