import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locales";
import { localizeAd } from "@/lib/ads";
import { adSources } from "@/lib/ads";
import NavLinks from "./NavLinks";
import LocaleSwitcher from "./LocaleSwitcher";
import { AdBanner } from "./ads";

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
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.facebook}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.twitter}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.instagram}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.youtube}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
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
          <Link href={`/${locale}`} className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt={`${dict.brandHi} ${dict.brandLo}`}
              width={180}
              height={48}
              className="h-24 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden lg:block">
            {(() => {
              const headerAd = adSources.find((ad) =>
                ad.placements.includes("header"),
              );
              return headerAd ? (
                <AdBanner
                  ad={localizeAd(headerAd, locale)}
                  dict={dict}
                  className="flex-1"
                />
              ) : null;
            })()}
          </div>

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