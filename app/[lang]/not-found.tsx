import Link from "next/link";
import { lang } from "next/root-params";
import { isLocale, defaultLocale, type Locale } from "@/lib/locales";
import { getDictionaryStatic } from "@/lib/dictionaries";

export default async function NotFound() {
  const current = await lang();
  const locale: Locale = isLocale(current) ? current : defaultLocale;
  const dict = getDictionaryStatic(locale);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">৪০৪</p>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">
        {dict.notFoundTitle}
      </h1>
      <p className="mt-2 text-gray-600">{dict.notFoundDesc}</p>
      <Link
        href={`/${locale}`}
        className="mt-6 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        {dict.backHome}
      </Link>
    </div>
  );
}