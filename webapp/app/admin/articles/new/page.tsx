import PageHeading from "@/components/admin/PageHeading";
import ArticleForm from "@/components/admin/articles/ArticleForm";

export default function AdminArticleNewPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="New Article"
        subtitle="Draft or publish an article in the database"
        breadcrumb={["Admin", "Articles", "New"]}
      />
      <ArticleForm />
    </div>
  );
}