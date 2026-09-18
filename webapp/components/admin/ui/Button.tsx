import type { ButtonHTMLAttributes } from "react";
import { cx } from "./utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "dangerOutline";

export type ButtonSize = "sm" | "md";

const sizes: Record<ButtonSize, string> = {
  sm: "gap-1.5 rounded-md px-2.5 py-1.5 text-xs",
  md: "gap-2 rounded-lg px-3.5 py-2 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-dark",
  secondary: "bg-ink-900 text-white shadow-sm hover:bg-ink-800",
  outline:
    "border border-gray-300 bg-white text-ink-900 hover:border-gray-400 hover:bg-gray-50",
  ghost: "text-ink-900 hover:bg-gray-100",
  danger: "bg-brand text-white shadow-sm hover:bg-brand-dark",
  dangerOutline:
    "border border-brand/30 text-brand hover:border-brand hover:bg-brand hover:text-white",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cx(
    "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40",
    sizes[size],
    variants[variant],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}