import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDownIcon, SearchIcon } from "@/components/admin/icons";
import { cx } from "./utils";

export function inputClass(
  error?: boolean,
  className?: string,
) {
  return cx(
    "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/15",
    error
      ? "border-brand"
      : "border-gray-300 hover:border-gray-400 focus:border-brand",
    className,
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function TextInput({ error, className, ...props }: TextInputProps) {
  return (
    <input {...props} aria-invalid={error || undefined} className={inputClass(error, className)} />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({ error, className, ...props }: TextAreaProps) {
  return (
    <textarea {...props} aria-invalid={error || undefined} className={inputClass(error, className)} />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <div className={cx("relative", className)}>
      <select
        {...props}
        aria-invalid={error || undefined}
        className={cx(
          inputClass(error),
          "cursor-pointer appearance-none pr-9",
        )}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: boolean;
}

export function SearchInput({ error, className, ...props }: SearchInputProps) {
  return (
    <div className={cx("relative", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        {...props}
        type="search"
        aria-invalid={error || undefined}
        className={cx(inputClass(error), "pl-9")}
      />
    </div>
  );
}

export function Checkbox({
  label,
  description,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-brand"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        {description && (
          <span className="block text-xs text-gray-400">{description}</span>
        )}
      </span>
    </label>
  );
}