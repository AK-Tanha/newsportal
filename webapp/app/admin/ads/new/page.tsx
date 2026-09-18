import PageHeading from "@/components/admin/PageHeading";
import AdvertisementForm from "@/components/admin/ads/AdvertisementForm";
import { getCmsAdSeeds } from "@/lib/admin-ads";

export default function AdminAdNewPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="New Advertisement"
        subtitle="Create an advertisement"
        breadcrumb={["Admin", "Advertisements", "New"]}
      />
      <AdvertisementForm seeds={getCmsAdSeeds()} />
    </div>
  );
}