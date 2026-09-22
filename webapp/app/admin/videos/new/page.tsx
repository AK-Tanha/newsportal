import PageHeading from "@/components/admin/PageHeading";
import VideoForm from "@/components/admin/videos/VideoForm";

export default function AdminVideoNewPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="New Video"
        subtitle="Draft or publish a video in the database"
        breadcrumb={["Admin", "Videos", "New"]}
      />
      <VideoForm />
    </div>
  );
}