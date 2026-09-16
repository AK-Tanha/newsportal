import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import {
  categories,
  getArticlesByCategory,
  getCategory,
  getCategoryName,
} from "@/lib/news";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { getAdsByPlacement } from "@/lib/ads";
import { HeroStory, SectionHeading, VerticalCard } from "@/components/news";
import { AdText, SponsoredAdCard } from "@/components/ads";

type Route = "/[lang]/category/[slug]";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<Route>): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : "bn";
  const category = getCategory(slug);
  return {
    title: category ? getCategoryName(category.slug, locale) : slug,
    description: category
      ? `${getCategoryName(category.slug, locale)} news | JagoShongbad`
      : `${slug} news | JagoShongbad`,
  };
}

export default async function CategoryPage({ params }: PageProps<Route>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const category = getCategory(slug);
  if (!category) notFound();

  const dict = getDictionaryStatic(locale);
  const items = getArticlesByCategory(category.slug, locale);
  const [lead, ...rest] = items;

  const inFeedAds = getAdsByPlacement("in-feed", locale);
  const sponsoredAd = inFeedAds.find((ad) => ad.type === "sponsored");
  const sidebarAds = getAdsByPlacement("sidebar", locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <SectionHeading
        title={getCategoryName(category.slug, locale)}
        href={`/${locale}/category/${category.slug}`}
        color={category.color}
      />

      {lead && (
        <div className="mb-8">
          <HeroStory article={lead} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          {rest.map((article, index) => (
            <div key={article.slug}>
              <VerticalCard article={article} />
              {sponsoredAd && index === 2 && (
                <SponsoredAdCard ad={sponsoredAd} dict={dict} className="mt-5" />
              )}
            </div>
          ))}
        </div>

        <aside className="rounded border border-gray-200 bg-white p-4">
          <h2 className="border-b-2 border-brand pb-2 text-base font-bold text-ink-800">
            {dict.otherCategories}
          </h2>
          <ul className="mt-3 space-y-1">
            {categories
              .filter((c) => c.slug !== category.slug)
              .map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/${locale}/category/${c.slug}`}
                    className="flex items-center justify-between rounded px-3 py-2 text-sm text-ink-800 transition-colors hover:bg-gray-50 hover:text-brand"
                  >
                    {c.name[locale]}
                    <span className="text-gray-300">&#8250;</span>
                  </Link>
                </li>
              ))}
          </ul>
          {sidebarAds[0] && <AdText ad={sidebarAds[0]} dict={dict} className="mt-6" />}
        </aside>
      </div>
    </div>
  );
}