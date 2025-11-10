import "../styles/globals.css";
import "../styles/halenoir.css";

import type { Metadata } from "next";
import { Russo_One, Inter } from "next/font/google";

import CursorTrail from "@/components/CursorTrail";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadModalProvider from "@/components/providers/LeadModalProvider";
import { getClubProfile, getContactInfo, getTheme } from "@/lib/api";

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
const SKY_GRADIENT =
  "linear-gradient(180deg, rgba(248,228,226,1) 0%, rgba(255,241,235,0.94) 20%, rgba(255,255,255,1) 65%, rgba(255,255,255,1) 100%)";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, club, theme] = await Promise.all([getContactInfo(), getClubProfile(), getTheme()]);
  const brandBg = theme?.background_color || DEFAULT_BG_COLOR;
  const themeVars: React.CSSProperties = {
    ["--brand-primary" as any]: theme?.primary_color || "#1A5ACB",
    ["--brand-secondary" as any]: theme?.secondary_color || "#FF6A00",
    ["--brand-grad-start" as any]: theme?.gradient_start || "#1A5ACB",
    ["--brand-grad-end" as any]: theme?.gradient_end || "#FF6A00",
    ["--brand-bg" as any]: brandBg,
  };
  const gradientLayer: React.CSSProperties = {
    backgroundImage: SKY_GRADIENT,
    backgroundAttachment: "fixed",
  };

  return (
    <html lang="ru">
      <body className={`${inter.variable} ${bebas.variable} min-h-screen text-gabi-gray`} style={themeVars}>
        <div className="fixed inset-0 -z-10" aria-hidden style={gradientLayer} />
        <div className="relative min-h-screen">
          <LeadModalProvider>
            <CursorTrail />
            <Header socialLinks={contact.social_links} />
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
