import PageHeading from "@/components/admin/PageHeading";
import VideosManager from "@/components/admin/videos/VideosManager";
import { getCmsVideoSeeds } from "@/lib/admin-videos";

export default function AdminVideosPage() {
  const seeds = getCmsVideoSeeds();
  const publishedCount = seeds.filter((video) => video.status === "published").length;
  const draftCount = seeds.length - publishedCount;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Videos"
        subtitle={`${seeds.length} videos — ${publishedCount} published, ${draftCount} draft${draftCount === 1 ? "" : "s"}`}
        breadcrumb={["Admin", "Videos"]}
      />
      <VideosManager seeds={seeds} />
    </div>
  );
}