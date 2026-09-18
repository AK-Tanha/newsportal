import type { ReactNode } from "react";
import { cx } from "./utils";

export type AlertTone = "info" | "success" | "warning" | "error";

const tones: Record<AlertTone, string> = {
  info: "border-blue-600/15 bg-blue-50 text-blue-800",
  success: "border-emerald-600/15 bg-emerald-50 text-emerald-800",
  warning: "border-amber-600/15 bg-amber-50 text-amber-800",
  error: "border-red-600/15 bg-red-50 text-red-800",
};

export function Alert({
  tone = "info",
  icon,
  title,
  className,
  children,
}: {
  tone?: AlertTone;
  icon?: ReactNode;
  title?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cx(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-3",
        tones[tone],
        className,
      )}
    >
      {icon && <span className="mt-0.5">{icon}</span>}
      <div className="min-w-0">
        {title && (
          <p className="text-sm font-semibold" id="alert-title">
            {title}
          </p>
        )}
        {children && <div className="text-[13px] leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}