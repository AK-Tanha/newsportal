import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import ArticleForm from "@/components/admin/articles/ArticleForm";

export default async function AdminArticleEditPage({
  params,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit Article"
        subtitle="Loaded from the Articles API"
        breadcrumb={["Admin", "Articles", "Edit"]}
      />
      <ArticleForm articleId={id} />
    </div>
  );
}