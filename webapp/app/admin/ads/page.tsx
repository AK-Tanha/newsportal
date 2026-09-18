import PageHeading from "@/components/admin/PageHeading";
import AdsManager from "@/components/admin/ads/AdsManager";
import { adStatusLabel, getCmsAdSeeds } from "@/lib/admin-ads";

export default function AdminAdsPage() {
  const seeds = getCmsAdSeeds();
  const activeCount = seeds.filter((ad) => ad.active).length;
  const inactiveCount = seeds.length - activeCount;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Advertisements"
        subtitle={`${seeds.length} ads — ${activeCount} ${adStatusLabel(
          true,
        ).toLowerCase()}, ${inactiveCount} ${adStatusLabel(false).toLowerCase()}`}
        breadcrumb={["Admin", "Advertisements"]}
      />
      <AdsManager seeds={seeds} />
    </div>
  );
}