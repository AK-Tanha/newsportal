import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupAd from "@/components/PopupAd";
import { isLocale, defaultLocale, type Locale } from "@/lib/locales";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { locales } from "@/lib/locales";
import { adSources } from "@/lib/ads";
import { localizeAd } from "@/lib/ads";

export const metadata: Metadata = {
  title: {
    default: "দৈনিক রুদ্রখবর | সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম",
    template: "%s | দৈনিক রুদ্রখবর",
  },
  description:
    "সত্য তথ্য ও বলিষ্ঠ কন্ঠে চলবে অবিরাম — দেশ ও বিদেশের সর্বশেষ খবর, জাতীয়, অর্থনীতি, আন্তর্জাতিক, খেলাধুলা, বিনোদন ও লাইফস্টাইল।",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionaryStatic(locale);

  const popupSource = adSources.find((a) => a.placements.includes("popup"));
  const popupAd = popupSource ? localizeAd(popupSource, locale) : null;

  return (
    <div lang={locale} className="flex min-h-screen flex-col bg-gray-100">
      <Header locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} dict={dict} />
      {popupAd && <PopupAd ad={popupAd} dict={dict} />}
    </div>
  );
}
