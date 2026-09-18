import { Button } from "./Button";

export function Pagination({
  page,
  totalPages,
  from,
  to,
  total,
  itemLabel,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-xs font-medium text-gray-500">
        Showing <span className="font-semibold text-ink-900">{from}</span>–
        <span className="font-semibold text-ink-900">{to}</span> of{" "}
        <span className="font-semibold text-ink-900">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="min-w-16 px-1 text-center text-xs font-semibold text-gray-500">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}