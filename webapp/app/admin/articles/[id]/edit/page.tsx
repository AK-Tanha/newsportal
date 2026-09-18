import type PageProps from "next";
import PageHeading from "@/components/admin/PageHeading";
import ArticleForm from "@/components/admin/articles/ArticleForm";
import { getCmsArticleSeeds } from "@/lib/admin-articles";

export default async function AdminArticleEditPage({
  params,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params;
  const seeds = getCmsArticleSeeds();
  const initial = seeds.find((article) => article.id === id);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Edit Article"
        subtitle={initial ? initial.title : "Article not found in the mock data"}
        breadcrumb={["Admin", "Articles", "Edit"]}
      />
      <ArticleForm seeds={seeds} initial={initial} articleId={id} />
    </div>
  );
}