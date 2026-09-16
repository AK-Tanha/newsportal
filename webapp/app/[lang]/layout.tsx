import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import { lang } from "next/root-params";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { isLocale, defaultLocale } from "@/lib/locales";
import type { Locale } from "@/lib/locales";
import { locales } from "@/lib/locales";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupAd from "@/components/PopupAd";
import { adSources, localizeAd } from "@/lib/ads";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jagoshongbad.example.com"),
  title: {
    default: "জাগোসংবাদ | বস্তুনিষ্ঠ সংবাদের অনলাইন ঠিকানা",
    template: "%s | জাগোসংবাদ",
  },
  description:
    "দেশ ও বিদেশের সর্বশেষ খবর, জাতীয়, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা, বিনোদন ও লাইফস্টাইল—সব এক ঠিকানায়।",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const rawLocale = await lang();
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionaryStatic(locale);

  const popupSource = adSources.find((ad) =>
    ad.placements.includes("popup"),
  );
  const popupAd = popupSource ? localizeAd(popupSource, locale) : null;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-gray-100"
        suppressHydrationWarning
      >
        <Header locale={locale} dict={dict} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} dict={dict} />
        {popupAd && <PopupAd ad={popupAd} dict={dict} />}
      </body>
    </html>
  );
}