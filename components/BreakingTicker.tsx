import Link from "next/link";
import { getBreakingArticles } from "@/lib/news";
import { getDictionaryStatic } from "@/lib/dictionaries";
import type { Locale } from "@/lib/locales";

export default function BreakingTicker({ locale }: { locale: Locale }) {
  const dict = getDictionaryStatic(locale);
  const breaking = getBreakingArticles(locale);

  if (breaking.length === 0) return null;

  const items = breaking.map((article) => article.title);

  return (
    <div className="flex items-center overflow-hidden border-b border-gray-200 bg-white">
      <div className="z-10 flex shrink-0 items-center gap-1.5 bg-brand px-4 py-3 text-sm font-bold text-white">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        {dict.breaking}
      </div>
      <div className="relative flex-1 overflow-hidden py-3">
        <div className="animate-ticker flex w-max whitespace-nowrap">
          {[...items, ...items].map((title, index) => (
            <Link
              key={`${title}-${index}`}
              href={`/${locale}/news/${breaking[index % breaking.length].slug}`}
              className="px-8 text-sm font-medium text-ink-800 transition-colors hover:text-brand"
            >
              <span className="mr-2 text-brand">&#9734;</span>
              {title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}