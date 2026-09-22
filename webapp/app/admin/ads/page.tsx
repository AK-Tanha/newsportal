import PageHeading from "@/components/admin/PageHeading";
import AdsManager from "@/components/admin/ads/AdsManager";

export default function AdminAdsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Advertisements"
        subtitle="Manage ads and their placements"
        breadcrumb={["Admin", "Advertisements"]}
      />
      <AdsManager />
    </div>
  );
}