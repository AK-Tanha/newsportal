import Link from "next/link";
import type { Locale } from "@/lib/locales";
import { isLocale } from "@/lib/locales";
import { notFound } from "next/navigation";
import {
  categories,
  getArticles,
  getArticlesByCategory,
  getCategoryName,
} from "@/lib/news";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { getAdsByPlacement } from "@/lib/ads";
import BreakingTicker from "@/components/BreakingTicker";
import { AdBanner, AdText } from "@/components/ads";
import {
  HeroStory,
  InlineStory,
  RankedStory,
  SectionHeading,
  SideStory,
  VerticalCard,
} from "@/components/news";

function parseViews(value: string) {
  return Number(value.replace(/[^\d]/g, ""));
}

const sectionSlugs: Array<"economy" | "sports" | "international" | "entertainment"> = [
  "economy",
  "sports",
  "international",
  "entertainment",
];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale: Locale = localeParam;
  const dict = getDictionaryStatic(locale);

  const featured = getArticles(locale).filter((a) => a.featured);
  const lead = featured[0];
  const rail = featured.slice(1, 5);
  const latest = getArticles(locale).slice(2, 10);

  const belowHeroAds = getAdsByPlacement("below-hero", locale);
  const inFeedAds = getAdsByPlacement("in-feed", locale);
  const sidebarAds = getAdsByPlacement("sidebar", locale);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <BreakingTicker locale={locale} />

      {/* Hero area */}
      <section className="mt-5 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">{lead && <HeroStory article={lead} />}</div>
        <aside className="rounded border border-gray-200 bg-white px-3 py-1">
          <h2 className="border-b-2 border-brand py-3 text-base font-bold text-ink-800">
            {dict.moreNews}
          </h2>
          {rail.map((article) => (
            <SideStory key={article.slug} article={article} />
          ))}
        </aside>
      </section>

      {/* Below hero ad */}
      {belowHeroAds[0] && (
        <section className="mt-6">
          <AdBanner ad={belowHeroAds[0]} dict={dict} />
        </section>
      )}

      {/* Main content + sidebar */}
      <section className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main column  */}
        <div className="space-y-10 lg:col-span-2">
          <section>
            <SectionHeading
              title={dict.latestNews}
              href={`/${locale}/category/national`}
            />
            <div className="rounded-b border border-gray-200 bg-white px-4 py-1">
              {latest.map((article) => (
                <InlineStory key={article.slug} article={article} />
              ))}
            </div>
          </section>

          {inFeedAds[0] && <AdText ad={inFeedAds[0]} dict={dict} />}

          {sectionSlugs.map((slug) => (
            <section key={slug}>
              <SectionHeading
                title={getCategoryName(slug, locale)}
                href={`/${locale}/category/${slug}`}
                color={
                  categories.find((c) => c.slug === slug)?.color ?? "#e2231a"
                }
              />
              <div className="grid gap-4 sm:grid-cols-3">
                {getArticlesByCategory(slug, locale)
                  .slice(0, 3)
                  .map((article) => (
                    <VerticalCard key={article.slug} article={article} />
                  ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <h2 className="mb-3 inline-block bg-brand px-3 py-1.5 text-lg font-bold text-white">
              {dict.mostRead}
            </h2>
            <div className="rounded-b border border-gray-200 bg-white p-4">
              {[...getArticles(locale)]
                .sort((a, b) => parseViews(b.views) - parseViews(a.views))
                .slice(0, 5)
                .map((article, index) => (
                  <RankedStory key={article.slug} article={article} rank={index + 1} />
                ))}
            </div>
          </div>

          {sidebarAds[0] && <AdText ad={sidebarAds[0]} dict={dict} />}

          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-base font-bold text-ink-800">
              {dict.categories}
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const count = getArticlesByCategory(category.slug, locale).length;
                return (
                  <li key={category.slug}>
                    <Link
                      href={`/${locale}/category/${category.slug}`}
                      className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm font-medium text-ink-800 transition-colors hover:text-brand"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name[locale]}
                      <span className="ml-auto text-xs text-gray-400">{count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded border border-gray-200 bg-white p-5">
            <h2 className="text-base font-bold text-ink-800">
              {dict.newsletterTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-500">{dict.newsletterDesc}</p>
            <p className="mt-4 rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm">
              <span className="text-brand">&#9993;</span> {dict.newsletterEmail}
            </p>
          </div>

          <div className="rounded border border-gray-200 bg-white p-5">
            <p className="text-sm leading-relaxed text-gray-600">
              {dict.techBlurb}
            </p>
            <Link
              href={`/${locale}/category/technology`}
              className="mt-2 inline-block text-sm font-semibold text-brand"
            >
              {dict.more} {">>"}
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}