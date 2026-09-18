import PageHeading from "@/components/admin/PageHeading";
import SettingsManager from "@/components/admin/settings/SettingsManager";
import { getDefaultCmsSettings } from "@/lib/admin-settings";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Settings"
        subtitle="Site-wide configuration — saved to this browser only (demo)"
        breadcrumb={["Admin", "Settings"]}
      />
      <SettingsManager defaults={getDefaultCmsSettings()} />
    </div>
  );
}