import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/locales";
import { isLocale } from "@/lib/locales";
import { categories, getArticles } from "@/lib/news";
import { getFeaturedVideos, getVideos } from "@/lib/videos";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { getAdsByPlacement } from "@/lib/ads";
import { RankedStory, SectionHeading } from "@/components/news";
import VideoPlayer from "@/components/VideoPlayer";
import { SideVideo, VideoCard } from "@/components/videos";
import { AdText } from "@/components/ads";

function parseViews(value: string) {
  return Number(value.replace(/[^\d]/g, ""));
}

export default async function VideosPage({
  params,
}: PageProps<"/[lang]/videos">) {
  const { lang: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale: Locale = localeParam;
  const dict = getDictionaryStatic(locale);

  const videos = getVideos(locale);
  const hero = getFeaturedVideos(locale)[0];
  const remaining = videos.filter((video) => video.slug !== hero?.slug);
  const sidebarVideos = videos.slice(0, 6);

  const sidebarAds = getAdsByPlacement("sidebar", locale);

  const mostRead = [...getArticles(locale)]
    .sort((a, b) => parseViews(b.views) - parseViews(a.views))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-gray-500">
        <Link href={`/${locale}`} className="hover:text-brand">
          {dict.home}
        </Link>
        <span>&#8250;</span>
        <span>{dict.video}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          {hero && (
            <section>
              <SectionHeading title={dict.featuredVideos} />
              <div className="rounded-b border border-gray-200 bg-white">
                <VideoPlayer video={hero} className="rounded-t" />
                <div className="p-4">
                  <Link href={`/${locale}/videos/${hero.slug}`}>
                    <h1 className="text-xl font-extrabold leading-snug text-ink-900 transition-colors hover:text-brand sm:text-2xl">
                      {hero.title}
                    </h1>
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {hero.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="font-semibold text-ink-800">
                      {hero.categoryName}
                    </span>
                    <span>{hero.duration}</span>
                    <span>
                      {hero.views} {dict.viewsLabel}
                    </span>
                    <span>{hero.publishedAt}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section>
            <SectionHeading title={dict.moreVideos} />
            <div className="grid gap-4 sm:grid-cols-2">
              {remaining.map((video) => (
                <VideoCard key={video.slug} video={video} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <h2 className="mb-3 inline-block bg-brand px-3 py-1.5 text-lg font-bold text-white">
              {dict.moreVideos}
            </h2>
            <div className="rounded-b border border-gray-200 bg-white p-4">
              {sidebarVideos.map((video) => (
                <SideVideo key={video.slug} video={video} />
              ))}
            </div>
          </div>

          {sidebarAds[0] && <AdText ad={sidebarAds[0]} dict={dict} />}

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