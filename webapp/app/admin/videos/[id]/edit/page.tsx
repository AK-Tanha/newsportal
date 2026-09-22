import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import VideoForm from "@/components/admin/videos/VideoForm";

export default async function AdminVideoEditPage({
  params,
}: PageProps<"/admin/videos/[id]/edit">) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit Video"
        subtitle="Loaded from the Videos API"
        breadcrumb={["Admin", "Videos", "Edit"]}
      />
      <VideoForm videoId={id} />
    </div>
  );
}