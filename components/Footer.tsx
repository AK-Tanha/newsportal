import Link from "next/link";
import { categories } from "@/lib/news";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locales";

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const footerGroups = [
    {
      title: dict.footerSections,
      links: categories.map((c) => ({
        label: c.name[locale],
        href: `/${locale}/category/${c.slug}`,
      })),
    },
    {
      title: dict.footerHelp,
      links: [
        { label: dict.aboutUs, href: `/${locale}` },
        { label: dict.contact, href: `/${locale}` },
        { label: dict.advertise, href: `/${locale}` },
        { label: dict.privacy, href: `/${locale}` },
      ],
    },
  ];

  return (
    <footer className="mt-12 bg-ink-900 text-gray-400">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="text-2xl font-extrabold text-white">
            <span className="text-brand">{dict.brandHi} </span>
            {dict.brandLo}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            {dict.footerAbout}
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h4 className="mb-4 border-b border-gray-700 pb-2 text-sm font-bold uppercase tracking-wide text-white">
              {group.title}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row">
          <p>{dict.copyright}</p>
          <p>{dict.editor}</p>
        </div>
      </div>
    </footer>
  );
}