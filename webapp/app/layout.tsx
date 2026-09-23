import type { Metadata } from "next";
import { Geist, Geist_Mono, Tiro_Bangla } from "next/font/google";
import { defaultLocale, type Locale } from "@/lib/locales";
import "./globals.css";

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
  subsets: ["latin"],
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
};

const defaultLocaleCode: Locale = defaultLocale;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={defaultLocaleCode}
      className={`${geistSans.variable} ${geistMono.variable} ${tiroBangla.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
