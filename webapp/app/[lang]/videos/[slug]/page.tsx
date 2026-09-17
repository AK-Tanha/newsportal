import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/locales";
import { getArticles, getCategory } from "@/lib/news";
import { getRelatedVideos, getVideoBySlug, videoSources } from "@/lib/videos";
import { getDictionaryStatic } from "@/lib/dictionaries";
import { getAdsByPlacement } from "@/lib/ads";
import VideoPlayer from "@/components/VideoPlayer";
import { VideoCard } from "@/components/videos";
import { CategoryTag, RankedStory } from "@/components/news";
import { AdText } from "@/components/ads";

type Route = "/[lang]/videos/[slug]";

export function generateStaticParams() {
  return videoSources.map((video) => ({ slug: video.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<Route>): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? (lang as Locale) : "bn";
  const video = getVideoBySlug(slug, locale);
  return {
    title: video?.title ?? "Video not found",
    description: video?.summary,
  };
}

export default async function VideoDetailPage({ params }: PageProps<Route>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;

  const video = getVideoBySlug(slug, locale);
  if (!video) notFound();

  const dict = getDictionaryStatic(locale);
  const category = getCategory(video.category);

  const related = getRelatedVideos(video, locale);
  const sidebarAds = getAdsByPlacement("sidebar", locale);

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
        <Link href={`/${locale}/videos`} className="hover:text-brand">
          {dict.video}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Video body */}
        <div className="lg:col-span-2">
          <CategoryTag
            name={video.categoryName}
            color={category?.color ?? "#e2231a"}
            className="mb-3"
          />
          <h1 className="text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            {video.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            {video.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-gray-200 py-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {video.duration}
            </span>
            <span>
              {video.views} {dict.viewsLabel}
            </span>
            <span>{video.publishedAt}</span>
          </div>

          <div className="mt-6">
            <VideoPlayer video={video} className="rounded border border-gray-200" />
          </div>

          <section className="mt-10">
            <h2 className="mb-4 inline-block bg-brand px-3 py-1.5 text-lg font-bold text-white">
              {dict.relatedVideos}
            </h2>
            {related.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <VideoCard key={item.slug} video={item} />
                ))}
              </div>
            ) : (
              <p className="rounded-b border border-gray-200 bg-white p-4 text-sm text-gray-500">
                {dict.otherCategories}
              </p>
            )}
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
        </aside>
      </div>
    </article>
  );
}