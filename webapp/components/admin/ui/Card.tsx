import type { ReactNode } from "react";
import { cx } from "./utils";

export function Card({
  className,
  children,
  padding = true,
}: {
  className?: string;
  children: ReactNode;
  padding?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-gray-200/80 bg-white shadow-sm",
        padding && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5",
        className,
      )}
    >
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-900">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}