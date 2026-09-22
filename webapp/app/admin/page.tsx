import PageHeading from "@/components/admin/PageHeading";
import {
  AdvertisementOverview,
  CardFrame,
  LiveStreamCard,
  MediaSummaryCard,
  RecentArticles,
  RecentVideos,
  StatCard,
} from "@/components/admin/dashboard";
import {
  ArticleIcon,
  CheckIcon,
  LiveIcon,
  MediaIcon,
  VideoIcon,
} from "@/components/admin/icons";
import {
  getAdvertisementOverviews,
  getCurrentLiveStream,
  getDashboardStats,
  getRecentArticles,
  getRecentVideos,
} from "@/lib/admin";

export default function AdminDashboardPage() {
  const stats = getDashboardStats();
  const articles = getRecentArticles(5);
  const videos = getRecentVideos(4);
  const live = getCurrentLiveStream();
  const ads = getAdvertisementOverviews(5);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Dashboard"
        subtitle="Overview of your newsroom content"
        breadcrumb={["Admin", "Dashboard"]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard
          label="Total Articles"
          value={stats.totalArticles}
          icon={<ArticleIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Published"
          value={stats.publishedArticles}
          icon={<CheckIcon className="h-5 w-5" />}
          color="#059669"
          hint={`${stats.draftArticles} draft${stats.draftArticles === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Total Videos"
          value={stats.totalVideos}
          icon={<VideoIcon className="h-5 w-5" />}
          color="#2563eb"
        />
        <StatCard
          label="Live Status"
          value={stats.liveStatus === "live" ? "Live" : "Offline"}
          icon={<LiveIcon className="h-5 w-5" />}
          color={stats.liveStatus === "live" ? "#e2231a" : "#6b7280"}
        />
        <StatCard
          label="Advertisements"
          value={stats.activeAdvertisements}
          icon={<MediaIcon className="h-5 w-5" />}
          color="#7c3aed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentArticles articles={articles} className="lg:col-span-2" />

        <div className="space-y-6">
          <LiveStreamCard stream={live} />
          <RecentVideos videos={videos} />
        </div>
      </div>

      <AdvertisementOverview ads={ads} />

      <MediaSummaryCard
        articles={stats.totalArticles}
        videos={stats.totalVideos}
      />

      <CardFrame title="Coming Soon">
        <div className="grid gap-4 text-sm text-gray-500 sm:grid-cols-3">
          <p>Articles, Videos, Live News, Advertisements, Media and Settings
            modules will each get dedicated management pages.</p>
          <p>Content stays editable while the frontend data sources are the
            single source of truth.</p>
          <p>Reach any module from the sidebar — the pages are placeholders
            until those modules ship.</p>
        </div>
      </CardFrame>
    </div>
  );
}