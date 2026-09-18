import PageHeading from "@/components/admin/PageHeading";
import ArticleForm from "@/components/admin/articles/ArticleForm";
import { getCmsArticleSeeds } from "@/lib/admin-articles";

export default function AdminArticleNewPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="New Article"
        subtitle="Draft or publish an article"
        breadcrumb={["Admin", "Articles", "New"]}
      />
      <ArticleForm seeds={getCmsArticleSeeds()} />
    </div>
  );
}