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

export const metadata: Metadata = {
  title: "Gabi Club — тренировки, кэмпы и блог",
  description:
    "Современный спортивный клуб с календарём тренировок, авторскими кэмпами и блогом о лыжах и трейле.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, club, theme] = await Promise.all([getContactInfo(), getClubProfile(), getTheme()]);
  const snowBg = resolveMediaUrl(theme?.snow_bg) || process.env.NEXT_PUBLIC_SNOW_BG;
  const themeVars: React.CSSProperties = {
    ["--brand-primary" as any]: theme?.primary_color || "#1A5ACB",
    ["--brand-secondary" as any]: theme?.secondary_color || "#FF6A00",
    ["--brand-grad-start" as any]: theme?.gradient_start || "#1A5ACB",
    ["--brand-grad-end" as any]: theme?.gradient_end || "#FF6A00",
    ["--brand-bg" as any]: theme?.background_color || "#E9E9E9",
  };

  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${bebas.variable} min-h-screen text-gabi-gray`}
        style={themeVars}
      >
        <div style={{ backgroundColor: "var(--brand-bg)" }}>
        {/* Site-wide subtle snow background */}
        {snowBg && (
          <div className="fixed inset-0 -z-10">
            <div
              className="absolute inset-0 bg-cover bg-top"
              style={{ backgroundImage: `url(${snowBg})` }}
              aria-hidden
            />
            <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.65)" }} aria-hidden />
          </div>
        )}
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
