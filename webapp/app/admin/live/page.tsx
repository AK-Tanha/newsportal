import PageHeading from "@/components/admin/PageHeading";
import LiveManager from "@/components/admin/live/LiveManager";

export default function AdminLivePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Live News"
        subtitle="Manage the current live stream configuration"
        breadcrumb={["Admin", "Live News"]}
      />
      <LiveManager />
    </div>
  );
}
