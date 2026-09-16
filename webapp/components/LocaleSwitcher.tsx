"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/locales";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(bn|en)/, "") || "/";
  const target: Locale = locale === "bn" ? "en" : "bn";
  const label = target === "bn" ? "বাংলা" : "English";

  return (
    <Link
      href={`/${target}${rest}`}
      aria-label={`Switch to ${label}`}
      className="rounded border border-white/25 px-2 py-0.5 font-semibold text-white transition-colors hover:bg-white/10"
    >
      {label}
    </Link>
  );
}