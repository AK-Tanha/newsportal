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
import { Card } from "@/components/admin/ui/Card";
import { Badge, CategoryChip } from "@/components/admin/ui/Badge";
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
    <section className={className}>
      <Card>
        <div className="mb-3.5 flex items-center justify-between border-b border-gray-100 pb-3.5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
            {title}
          </h2>
          {action}
        </div>
        {children}
      </Card>
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
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-tight tracking-tight text-ink-900">
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {icon}
        </span>
      </div>
      {hint && <p className="mt-2.5 text-xs text-gray-400">{hint}</p>}
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
      action={
        <span className="text-xs font-semibold text-brand hover:underline">View all</span>
      }
    >
      <ul className="divide-y divide-gray-100">
        {articles.map((article) => (
          <li key={article.slug} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <ArticleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-ink-900">
                {article.title}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                <CategoryChip
                  name={article.categoryName}
                  color={getCategory(article.category)?.color ?? "#e2231a"}
                />
                <span>{article.publishedAt}</span>
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium text-gray-400">
              {article.views}
            </span>
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
      action={<span className="text-xs font-semibold text-brand hover:underline">View all</span>}
    >
      <ul className="divide-y divide-gray-100">
        {videos.map((video) => (
          <li key={video.slug} className="py-3 first:pt-0 last:pb-0">
            <p className="line-clamp-2 text-sm font-semibold text-ink-900">{video.title}</p>
            <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-400">
              <span className="inline-flex items-center gap-1 font-medium">
                <ClockIcon className="h-3.5 w-3.5" />
                {video.duration}
              </span>
              <span className="inline-flex items-center gap-1 font-medium">
                <EyeIcon className="h-3.5 w-3.5" />
                {video.views}
              </span>
            </div>
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
          <p className="mt-3 line-clamp-2 text-[15px] font-semibold text-ink-900">
            {stream.title}
          </p>
          <ul className="mt-3 space-y-2.5 text-xs text-gray-500">
            <li className="flex items-center gap-2">
              <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
              Started {stream.startedAt}
            </li>
            <li className="flex items-center gap-2">
              <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
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

function adTypeBadge(type: AdType) {
  switch (type) {
    case "banner":
      return <Badge tone="blue">Banner</Badge>;
    case "text":
      return <Badge tone="gray">Text</Badge>;
    case "sponsored":
      return <Badge tone="brand">Sponsored</Badge>;
  }
}

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
          {ads.map((ad) => (
            <li
              key={ad.slug}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{ad.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {ad.placementsCount} placement{ad.placementsCount === 1 ? "" : "s"}
                  {ad.sponsored && " • Sponsored"}
                </p>
              </div>
              {adTypeBadge(ad.type)}
            </li>
          ))}
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
        library. Media management is available from the Media module.
      </p>
    </CardFrame>
  );
}