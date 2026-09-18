import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import AdvertisementForm from "@/components/admin/ads/AdvertisementForm";
import { getCmsAdSeeds } from "@/lib/admin-ads";

export default async function AdminAdEditPage({
  params,
}: PageProps<"/admin/ads/[id]/edit">) {
  const { id } = await params;
  const seeds = getCmsAdSeeds();
  const initial = seeds.find((ad) => ad.id === id);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit Advertisement"
        subtitle={initial ? initial.name : "Advertisement not found in the mock data"}
        breadcrumb={["Admin", "Advertisements", "Edit"]}
      />
      <AdvertisementForm seeds={seeds} initial={initial} adId={id} />
    </div>
  );
}