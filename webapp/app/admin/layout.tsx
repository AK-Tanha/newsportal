import type { Metadata } from "next";
import { adminAppInfo } from "@/lib/admin";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin — Daily Rudro Khobor",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
