export default function PageHeading({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
}) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-1 text-xs font-medium text-gray-500">
          {breadcrumb.map((crumb, index) => (
            <span key={index}>
              {index > 0 && <span className="mx-1 text-gray-400">/</span>}
              {crumb}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}