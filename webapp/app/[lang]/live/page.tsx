import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/locales";
import { isLocale } from "@/lib/locales";
import { categories, getArticles, getCategory } from "@/lib/news";
import { getLiveStream } from "@/lib/live";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { getAdsByPlacement } from "@/lib/ads";
import LivePlayer from "@/components/LivePlayer";
import {
  CategoryTag,
  InlineStory,
  RankedStory,
  SectionHeading,
} from "@/components/news";
import { AdText } from "@/components/ads";

function parseViews(value: string) {
  return Number(value.replace(/[^\d]/g, ""));
}

export default async function LivePage({
  params,
}: PageProps<"/[lang]/live">) {
  const { lang: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale: Locale = localeParam;
  const dict = getDictionaryStatic(locale);

  const stream = getLiveStream(locale);
  const streamCategory = stream ? getCategory(stream.category) : undefined;
  const isLive = stream?.status === "live";

  const latest = getArticles(locale).slice(0, 6);
  const mostRead = [...getArticles(locale)]
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, 5);
  const sidebarAds = getAdsByPlacement("sidebar", locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">
          {dict.home}
        </Link>
        <span>&#8250;</span>
        <span>{dict.live}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {stream ? (
            <section className="overflow-hidden rounded-b border border-gray-200 bg-white">
              {/* Prominent live status bar */}
              <div
                className={`flex items-center gap-2 px-4 py-2 ${
                  isLive ? "bg-brand" : "bg-gray-500"
                }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      isLive ? "bg-white" : "bg-white/60"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                      isLive ? "bg-white" : "bg-white/90"
                    }`}
                  />
                </span>
                <span className="text-base font-extrabold uppercase tracking-wider text-white">
                  {isLive ? dict.live : dict.offTheAir}
                </span>
                {isLive && (
                  <span className="ml-auto text-xs font-semibold text-white/90">
                    {dict.liveNow}
                  </span>
                )}
              </div>

              <LivePlayer stream={stream} />

              <div className="border-t border-gray-200 p-4">
                <CategoryTag
                  name={stream.categoryName}
                  color={streamCategory?.color ?? "#e2231a"}
                  className="mb-2"
                />
                <h1 className="text-xl font-extrabold leading-snug text-ink-900 sm:text-2xl">
                  {stream.title}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {stream.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  {isLive && (
                    <span>
                      {stream.viewers} {dict.viewers}
                    </span>
                  )}
                  <span>{stream.startedAt}</span>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded border border-dashed border-gray-300 bg-white p-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
                </svg>
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink-900">
                {dict.noStreamTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
                {dict.noStreamDesc}
              </p>
            </section>
          )}

          {/* Latest news */}
          <section>
            <SectionHeading title={dict.latestNews} href={`/${locale}`} />
            <div className="rounded-b border border-gray-200 bg-white px-4 py-1">
              {latest.map((article) => (
                <InlineStory key={article.slug} article={article} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
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

          <div className="rounded border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-base font-bold text-ink-800">
              {dict.categories}
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
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
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}