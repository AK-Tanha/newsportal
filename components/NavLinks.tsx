"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { categories, getArticlesByCategory } from "@/lib/news";
import type { Locale } from "@/lib/locales";
import { getDictionaryStatic } from "@/lib/dictionaries";

export default function NavLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = getDictionaryStatic(locale);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const base =
    "nav-link whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors hover:text-brand";

  const open = openCategory
    ? categories.find((c) => c.slug === openCategory)
    : null;
  const panelColor = open?.color ?? "#e2231a";
  const panelArticles = open
    ? getArticlesByCategory(open.slug, locale).slice(0, 4)
    : [];

  return (
    <nav
      className="flex w-full items-center gap-1 overflow-x-auto"
      onMouseLeave={() => setOpenCategory(null)}
      onFocusCapture={(e) => {
        const slug = (e.target as HTMLElement).dataset.menu;
        if (slug) setOpenCategory(slug);
      }}
      onBlurCapture={() => {
        if (!openCategory) return;
        setOpenCategory(null);
      }}
    >
      <Link
        href={`/${locale}`}
        className={`${base} ${
          pathname === `/${locale}` ? "text-brand" : "text-ink-800"
        }`}
        onMouseEnter={() => setOpenCategory(null)}
      >
        {dict.home}
      </Link>
      {categories.map((category) => {
        const active = pathname === `/${locale}/category/${category.slug}`;
        return (
          <div
            key={category.slug}
            className="relative"
            onMouseEnter={() => setOpenCategory(category.slug)}
          >
            <Link
              href={`/${locale}/category/${category.slug}`}
              data-menu={category.slug}
              className={`${base} ${
                active
                  ? "text-brand"
                  : openCategory === category.slug
                    ? "text-brand"
                    : "text-ink-800"
              }`}
            >
              {category.name[locale]}
            </Link>
          </div>
        );
      })}

      {/* Megamenu panel */}
      {open && openCategory && (
        <div
          className="absolute right-0 left-0 top-full z-20 hidden rounded-b-lg border-t-4 bg-white p-6 shadow-xl ring-1 ring-gray-100 md:block"
          style={{ borderTopColor: panelColor }}
          onMouseEnter={() => setOpenCategory(openCategory)}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: panelColor }}
              />
              <Link
                href={`/${locale}/category/${openCategory}`}
                className="text-base font-bold text-ink-900 hover:text-brand"
              >
                {open.name[locale]}
              </Link>
            </div>
            <Link
              href={`/${locale}/category/${openCategory}`}
              className="text-sm font-semibold text-brand hover:underline"
            >
              {dict.more} {">>"}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {panelArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/news/${article.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(min-width: 1024px) 256px, 160px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand">
                  {article.title}
                </h4>
                <p className="mt-1 text-xs text-gray-500">{article.publishedAt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}