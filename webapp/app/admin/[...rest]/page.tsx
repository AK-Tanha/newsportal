import Link from "next/link";
import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import { CardFrame } from "@/components/admin/dashboard";

export default async function AdminModulePlaceholderPage({
  params,
}: PageProps<"/admin/[...rest]">) {
  const { rest } = await params;
  const segment = rest[0] ?? "module";
  const title = segment.replace(/^\w/, (c: string) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <PageHeading
        title={title}
        subtitle="This module is not implemented yet."
        breadcrumb={["Admin", title]}
      />
      <CardFrame title="Under construction">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            The {title} management page will be added in a later step of the
            admin panel buildout. For now it is reachable from the sidebar to
            reserve the route and navigation structure.
          </p>
          <Link
            href="/admin"
            className="inline-block rounded bg-ink-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </CardFrame>
    </div>
  );
}