import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locales";
import NavLinks from "./NavLinks";
import LocaleSwitcher from "./LocaleSwitcher";

export default function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <header>
      {/* Top utility strip */}
      <div className="bg-ink-900 text-gray-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs">
          <p>{dict.date}</p>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href={`/${locale}`} className="hover:text-white">
              {dict.printEdition}
            </Link>
            <Link href={`/${locale}`} className="hover:text-white">
              {dict.epaper}
            </Link>
            <LocaleSwitcher locale={locale} />
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <Link href={`/${locale}`} className="flex shrink-0 flex-col">
            <span className="text-3xl font-extrabold leading-none tracking-tight text-ink-900">
              <span className="text-brand">{dict.brandHi} </span>
              {dict.brandLo}
            </span>
            <span className="mt-1 text-[11px] font-medium text-gray-500">
              {dict.tagline}
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <label className="flex w-72 items-center gap-2 border border-gray-300 px-3 py-2">
              <span aria-hidden>&#128269;</span>
              <input
                type="search"
                aria-label={dict.searchPlaceholder}
                placeholder={dict.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Primary nav */}
      <div className="sticky top-0 z-50 border-b-2 border-brand bg-white/95 shadow-sm backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center px-4">
          <NavLinks locale={locale} />
        </div>
      </div>
    </header>
  );
}