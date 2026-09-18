import type { ReactNode } from "react";
import { cx } from "./utils";

export type BadgeTone =
  | "brand"
  | "gray"
  | "green"
  | "blue"
  | "amber"
  | "violet";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand/10 text-brand",
  gray: "bg-gray-100 text-gray-600",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10",
};

export function Badge({
  tone = "gray",
  dot,
  dotClass = "bg-current",
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  dotClass?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className={cx("h-1.5 w-1.5 rounded-full", dotClass)} />
      )}
      {children}
    </span>
  );
}

export function CategoryChip({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={{ backgroundColor: `${color ?? "#6b7280"}1A`, color: color ?? "#6b7280" }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color ?? "#6b7280" }}
      />
      {name}
    </span>
  );
}