import PageHeading from "@/components/admin/PageHeading";
import ArticlesManager from "@/components/admin/articles/ArticlesManager";

export default function AdminArticlesPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Articles"
        subtitle="Published and drafted articles managed through the Articles API"
        breadcrumb={["Admin", "Articles"]}
      />
      <ArticlesManager />
    </div>
  );
}