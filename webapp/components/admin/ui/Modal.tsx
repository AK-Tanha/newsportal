import type { ReactNode } from "react";
import { CloseIcon } from "@/components/admin/icons";
import { cx } from "./utils";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  icon,
  width = "sm",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={cx(
          "relative w-full animate-pop-in rounded-xl bg-white shadow-2xl ring-1 ring-gray-900/5",
          widths[width],
        )}
      >
        <div className="flex items-start gap-3 px-5 pt-5">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-ink-900">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-ink-900"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        {children && <div className="px-5 pb-5 pt-4">{children}</div>}
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-xl border-t border-gray-100 bg-gray-50 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}