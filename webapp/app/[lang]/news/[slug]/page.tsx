import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import {
  articleSources,
  getArticleBySlug,
  getArticles,
  getCategory,
} from "@/lib/news";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { getAdsByPlacement } from "@/lib/ads";
import { CategoryTag, RankedStory } from "@/components/news";
import { AdBanner, AdText } from "@/components/ads";

type Route = "/[lang]/news/[slug]";

export function generateStaticParams() {
  return articleSources.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<Route>): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : "bn";
  const article = getArticleBySlug(slug, locale);
  return {
    title: article?.title ?? "Article not found",
    description: article?.summary,
  };
}

export default async function NewsPage({ params }: PageProps<Route>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const article = getArticleBySlug(slug, locale);
  if (!article) notFound();

  const dict = getDictionaryStatic(locale);
  const category = getCategory(article.category);

  const inContentAds = getAdsByPlacement("in-content", locale);
  const inContentAd = inContentAds[0];
  const sidebarAds = getAdsByPlacement("sidebar", locale);

  const related = getArticles(locale)
    .filter((a) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 5);
  const mostRead = [...getArticles(locale)]
    .sort(
      (a, b) =>
        Number(b.views.replace(/[^\d]/g, "")) -
        Number(a.views.replace(/[^\d]/g, "")),
    )
    .slice(0, 5);

  return (
    <article className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">
          {dict.home}
        </Link>
        <span>&#8250;</span>
        <Link
          href={`/${locale}/category/${article.category}`}
          className="hover:text-brand"
        >
          {category?.name[locale]}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Article body */}
        <div className="lg:col-span-2">
          <CategoryTag
            name={article.categoryName}
            color={category?.color ?? "#e2231a"}
            className="mb-3"
          />
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            {article.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            {article.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-gray-200 py-3 text-sm text-gray-500">
            <span className="font-semibold text-ink-800">{article.author}</span>
            <span>{article.publishedAt}</span>
            <span>
              {article.readTime} {dict.readMinutes}
            </span>
            <span>
              {article.views} {dict.viewsLabel}
            </span>
          </div>

          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden">
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="mt-6 space-y-5">
            {article.content.map((paragraph, index) => (
              <div key={index}>
                <p className="text-[17px] leading-relaxed text-ink-800">
                  {paragraph}
                </p>
                {inContentAd && index === Math.floor(article.content.length / 2) && (
                  <AdBanner ad={inContentAd} dict={dict} className="my-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <h2 className="mb-3 inline-block bg-brand px-3 py-1.5 text-lg font-bold text-white">
              {dict.relatedNews}
            </h2>
            <div className="rounded-b border border-gray-200 bg-white p-4">
              {related.length > 0 ? (
                related.map((story, index) => (
                  <RankedStory
                    key={story.slug}
                    article={story}
                    rank={index + 1}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  {dict.otherCategories}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 inline-block bg-brand px-3 py-1.5 text-lg font-bold text-white">
              {dict.mostRead}
            </h2>
            <div className="rounded-b border border-gray-200 bg-white p-4">
              {mostRead.map((story, index) => (
                <RankedStory
                  key={story.slug}
                  article={story}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>

          {sidebarAds[0] && <AdText ad={sidebarAds[0]} dict={dict} />}
        </aside>
      </div>
    </article>
  );
}