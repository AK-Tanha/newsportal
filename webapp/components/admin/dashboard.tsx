import type { ReactNode } from "react";
import type { Article } from "@/lib/news";
import { getCategory } from "@/lib/news";
import type { Video } from "@/lib/videos";
import type { AdType } from "@/lib/ads";
import type {
  AdvertisementSummary,
  LiveStreamSummary,
} from "@/lib/admin";
import { LiveBadge } from "@/components/LivePlayer";
import { CategoryTag } from "@/components/news";
import {
  ArticleIcon,
  ClockIcon,
  EyeIcon,
  LiveIcon,
  MediaIcon,
  UsersIcon,
} from "./icons";

export function CardFrame({
  title,
  children,
  className = "",
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded bg-white shadow ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink-900">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color = "#e2231a",
  hint,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  hint?: string;
}) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-tight text-ink-900">{value}</p>
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export function RecentArticles({
  articles,
  className = "",
}: {
  articles: Article[];
  className?: string;
}) {
  return (
    <CardFrame
      title="Recent Articles"
      className={className}
      action={<span className="text-xs font-semibold text-brand">View all</span>}
    >
      <ul className="divide-y divide-gray-100">
        {articles.map((article) => (
          <li key={article.slug} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <ArticleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-ink-900">
                {article.title}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <CategoryTag
                  name={article.categoryName}
                  color={getCategory(article.category)?.color ?? "#e2231a"}
                  className="!px-1.5 !py-0.5"
                />
                <span>{article.publishedAt}</span>
              </div>
            </div>
            <span className="shrink-0 text-xs text-gray-500">{article.views}</span>
          </li>
        ))}
      </ul>
    </CardFrame>
  );
}

export function RecentVideos({ videos }: { videos: Video[] }) {
  return (
    <CardFrame
      title="Recent Videos"
      action={<span className="text-xs font-semibold text-brand">View all</span>}
    >
      <ul className="divide-y divide-gray-100">
        {videos.map((video) => (
          <li key={video.slug} className="py-3 first:pt-0 last:pb-0">
            <p className="line-clamp-2 text-sm font-bold text-ink-900">{video.title}</p>
            <p className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {video.duration}
              </span>
              <span className="inline-flex items-center gap-1">
                <EyeIcon className="h-3.5 w-3.5" />
                {video.views}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </CardFrame>
  );
}

export function LiveStreamCard({ stream }: { stream: LiveStreamSummary | null }) {
  return (
    <CardFrame title="Live Stream" action={<LiveIcon className="h-4 w-4 text-brand" />}>
      {stream ? (
        <div>
          <LiveBadge
            status={stream.status}
            liveLabel="Live"
            offlineLabel="Off the air"
          />
          <p className="mt-3 line-clamp-2 text-sm font-bold text-ink-900">
            {stream.title}
          </p>
          <ul className="mt-3 space-y-2 text-xs text-gray-500">
            <li className="flex items-center gap-2">
              <ClockIcon className="h-3.5 w-3.5" />
              Started {stream.startedAt}
            </li>
            <li className="flex items-center gap-2">
              <UsersIcon className="h-3.5 w-3.5" />
              {stream.viewers} viewers
            </li>
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No live stream configured.</p>
      )}
    </CardFrame>
  );
}

const adTypeStyles: Record<AdType, { label: string; className: string }> = {
  banner: { label: "Banner", className: "bg-blue-100 text-blue-700" },
  text: { label: "Text", className: "bg-gray-100 text-gray-600" },
  sponsored: { label: "Sponsored", className: "bg-brand/10 text-brand" },
};

export function AdvertisementOverview({
  ads,
}: {
  ads: AdvertisementSummary[];
}) {
  return (
    <CardFrame title="Advertisements">
      {ads.length === 0 ? (
        <p className="text-sm text-gray-500">No advertisements configured.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {ads.map((ad) => {
            const style = adTypeStyles[ad.type];
            return (
              <li key={ad.slug} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink-900">{ad.title}</p>
                  <p className="text-xs text-gray-500">
                    {ad.placementsCount} placement{ad.placementsCount === 1 ? "" : "s"}
                    {ad.sponsored && " • Sponsored"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${style.className}`}
                >
                  {style.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </CardFrame>
  );
}

export function MediaSummaryCard({
  articles,
  videos,
}: {
  articles: number;
  videos: number;
}) {
  return (
    <CardFrame title="Media Library" action={<MediaIcon className="h-4 w-4 text-brand" />}>
      <p className="text-sm text-gray-500">
        {articles} article images and {videos} video thumbnails are referenced in the
        library. Media management is coming with the Media module.
      </p>
    </CardFrame>
  );
}