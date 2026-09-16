import Image from "next/image";
import Link from "next/link";
import { lang } from "next/root-params";
import type { Article } from "@/lib/news";
import { getCategory } from "@/lib/news";
import { getDictionary } from "@/lib/i18n";

export function CategoryTag({
  name,
  color,
  className = "",
}: {
  name: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-bold text-white ${className}`}
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}

export async function SectionHeading({
  title,
  href,
  color = "#e2231a",
}: {
  title: string;
  href?: string;
  color?: string;
}) {
  const dict = await getDictionary();
  return (
    <div className="mb-4 flex items-center justify-between border-b-2 border-gray-200 pb-2">
      <h2
        className="text-lg font-bold tracking-tight text-white"
        style={{ backgroundColor: color }}
      >
        {href ? (
          <Link href={href} className="block px-3 py-1.5">
            {title}
          </Link>
        ) : (
          <span className="block px-3 py-1.5">{title}</span>
        )}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-xs font-semibold text-gray-500 hover:text-brand"
        >
          {dict.more} {">>"}
        </Link>
      )}
    </div>
  );
}

export async function HeroStory({ article }: { article: Article }) {
  const locale = await lang();
  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group block overflow-hidden bg-white"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <CategoryTag
          name={article.categoryName}
          color={getCategory(article.category)?.color ?? "#e2231a"}
          className="absolute left-3 top-3"
        />
      </div>
      <div className="relative -mt-10 px-5 pb-5">
        <h2 className="text-2xl font-bold leading-snug text-white drop-shadow-sm transition-colors group-hover:text-brand">
          {article.title}
        </h2>
        <p className="mt-2 hidden text-sm leading-relaxed text-gray-200 sm:block">
          {article.summary}
        </p>
      </div>
    </Link>
  );
}

export async function SideStory({ article }: { article: Article }) {
  const locale = await lang();
  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group flex gap-3 border-b border-gray-100 py-3 last:border-0"
    >
      <div className="relative h-[68px] w-[100px] shrink-0 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="100px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className="absolute bottom-0 left-0 px-1 py-0.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: getCategory(article.category)?.color }}
        >
          {article.categoryName}
        </span>
      </div>
      <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand">
        {article.title}
      </h3>
    </Link>
  );
}

export async function VerticalCard({ article }: { article: Article }) {
  const locale = await lang();
  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group block overflow-hidden rounded-b bg-white"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 250px, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <CategoryTag
          name={article.categoryName}
          color={getCategory(article.category)?.color ?? "#e2231a"}
          className="absolute left-2 top-2"
        />
      </div>
      <div className="p-3">
        <h3 className="line-clamp-3 text-[15px] font-bold leading-snug text-ink-800 transition-colors group-hover:text-brand">
          {article.title}
        </h3>
        <p className="mt-1.5 text-xs text-gray-500">{article.publishedAt}</p>
      </div>
    </Link>
  );
}

export async function InlineStory({ article }: { article: Article }) {
  const locale = await lang();
  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group flex gap-4 border-b border-gray-100 py-4 last:border-0"
    >
      <div className="relative aspect-[16/10] w-40 shrink-0 overflow-hidden sm:w-52">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 208px, 160px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div>
        <CategoryTag
          name={article.categoryName}
          color={getCategory(article.category)?.color ?? "#e2231a"}
          className="mb-2 hidden sm:inline-block"
        />
        <h3 className="line-clamp-3 text-[17px] font-bold leading-snug text-ink-800 transition-colors group-hover:text-brand">
          {article.title}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500">{article.publishedAt}</p>
      </div>
    </Link>
  );
}

export async function RankedStory({
  article,
  rank,
}: {
  article: Article;
  rank: number;
}) {
  const locale = await lang();
  const dict = await getDictionary();
  return (
    <Link
      href={`/${locale}/news/${article.slug}`}
      className="group flex gap-4 border-b border-gray-100 py-3.5 last:border-0"
    >
      <span
        className={`text-3xl font-extrabold leading-none ${
          rank <= 3 ? "text-brand" : "text-gray-300"
        }`}
      >
        {rank}
      </span>
      <div>
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-800 transition-colors group-hover:text-brand">
          {article.title}
        </h4>
        <p className="mt-1 text-xs text-gray-500">
          {article.views} {dict.readers}
        </p>
      </div>
    </Link>
  );
}