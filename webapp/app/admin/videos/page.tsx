import PageHeading from "@/components/admin/PageHeading";
import VideosManager from "@/components/admin/videos/VideosManager";

export default function AdminVideosPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Videos"
        subtitle="Published and drafted videos managed through the Videos API"
        breadcrumb={["Admin", "Videos"]}
      />
      <VideosManager />
    </div>
  );
}