import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import AdvertisementForm from "@/components/admin/ads/AdvertisementForm";

export default async function AdminAdEditPage({
  params,
}: PageProps<"/admin/ads/[id]/edit">) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit Advertisement"
        subtitle="Loaded from the Ads API"
        breadcrumb={["Admin", "Advertisements", "Edit"]}
      />
      <AdvertisementForm adId={id} />
    </div>
  );
}