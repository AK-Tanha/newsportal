import type { Metadata } from "next";
import { Geist, Geist_Mono, Tiro_Bangla } from "next/font/google";
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

const tiroBangla = Tiro_Bangla({
  variable: "--font-tiro-bangla",
  subsets: ["bengali"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rudrokhobor.example.com"),
  title: {
    default: "দৈনিক রুদ্রখবর | সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম",
    template: "%s | দৈনিক রুদ্রখবর",
  },
  description:
    "সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম — দেশ ও বিদেশের সর্বশেষ খবর, জাতীয়, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা, বিনোদন ও লাইফস্টাইল।",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "দৈনিক রুদ্রখবর | সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম",
    description:
      "সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম — দেশ ও বিদেশের সর্বশেষ খবর, জাতীয়, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা, বিনোদন ও লাইফস্টাইল।",
    siteName: "দৈনিক রুদ্রখবর",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const rawLocale = (await lang()) ?? defaultLocale;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionaryStatic(locale);

  const popupSource = adSources.find((ad) =>
    ad.placements.includes("popup"),
  );
  const popupAd = popupSource ? localizeAd(popupSource, locale) : null;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${tiroBangla.variable} h-full antialiased`}
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