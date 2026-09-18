import PageHeading from "@/components/admin/PageHeading";
import MediaManager from "@/components/admin/media/MediaManager";
import { getCmsMediaSeeds } from "@/lib/admin-media";

export default function AdminMediaPage() {
  const seeds = getCmsMediaSeeds();
  const images = seeds.filter((media) => media.type === "image").length;
  const videos = seeds.length - images;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Media Library"
        subtitle={`${seeds.length} media files — ${images} images, ${videos} videos`}
        breadcrumb={["Admin", "Media Library"]}
      />
      <MediaManager seeds={seeds} />
    </div>
  );
}