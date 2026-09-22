export default function PageHeading({
  title,
  subtitle,
  breadcrumb,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <li>Newsroom Admin</li>
            {breadcrumb.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1.5">
                <span aria-hidden className="text-gray-300">
                  /
                </span>
                <span
                  className={index === breadcrumb.length - 1 ? "text-gray-600" : undefined}
                >
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}