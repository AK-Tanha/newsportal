import PageHeading from "@/components/admin/PageHeading";
import ArticlesManager from "@/components/admin/articles/ArticlesManager";
import { getCmsArticleSeeds, statusLabel } from "@/lib/admin-articles";

export default function AdminArticlesPage() {
  const seeds = getCmsArticleSeeds();
  const publishedCount = seeds.filter((article) => article.status === "published").length;
  const draftCount = seeds.length - publishedCount;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Articles"
        subtitle={`${seeds.length} articles — ${publishedCount} ${statusLabel(
          "published",
        ).toLowerCase()}, ${draftCount} draft${draftCount === 1 ? "" : "s"}`}
        breadcrumb={["Admin", "Articles"]}
      />
      <ArticlesManager seeds={seeds} />
    </div>
  );
}