import PageHeading from "@/components/admin/PageHeading";
import VideoForm from "@/components/admin/videos/VideoForm";
import { getCmsVideoSeeds } from "@/lib/admin-videos";

export default function AdminVideoNewPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="New Video"
        subtitle="Draft or publish a video"
        breadcrumb={["Admin", "Videos", "New"]}
      />
      <VideoForm seeds={getCmsVideoSeeds()} />
    </div>
  );
}