import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import VideoForm from "@/components/admin/videos/VideoForm";
import { getCmsVideoSeeds } from "@/lib/admin-videos";

export default async function AdminVideoEditPage({
  params,
}: PageProps<"/admin/videos/[id]/edit">) {
  const { id } = await params;
  const seeds = getCmsVideoSeeds();
  const initial = seeds.find((video) => video.id === id);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit Video"
        subtitle={initial ? initial.title : "Video not found in the mock data"}
        breadcrumb={["Admin", "Videos", "Edit"]}
      />
      <VideoForm seeds={seeds} initial={initial} videoId={id} />
    </div>
  );
}