import "../styles/globals.css";

import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";

import CursorTrail from "@/components/CursorTrail";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LeadModalProvider from "@/components/providers/LeadModalProvider";
import { getClubProfile, getContactInfo } from "@/lib/api";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export const metadata: Metadata = {
  title: "Gabi Club — тренировки, кэмпы и блог",
  description:
    "Современный спортивный клуб с календарём тренировок, авторскими кэмпами и блогом о лыжах и трейле.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [contact, club] = await Promise.all([getContactInfo(), getClubProfile()]);
  const snowBg = process.env.NEXT_PUBLIC_SNOW_BG;

  return (
    <html lang="ru">
      <body className={`${inter.variable} ${bebas.variable} min-h-screen bg-slate-50 text-gabi-gray`}>
        {/* Site-wide subtle snow background */}
        {snowBg && (
          <div className="fixed inset-0 -z-10">
            <div
              className="absolute inset-0 bg-cover bg-top"
              style={{ backgroundImage: `url(${snowBg})` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" aria-hidden />
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
      </body>
    </html>
  );
}
