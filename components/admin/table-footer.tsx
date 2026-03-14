import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableFooterProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalEntries: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function AdminTableFooter({
  currentPage,
  totalPages,
  perPage,
  totalEntries,
  onPrevious,
  onNext,
}: TableFooterProps) {
  const from = totalEntries === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalEntries);

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Showing Footer Table Entries */}
      <p className="text-sm text-muted-foreground">
        Showing {from} to {to} of {totalEntries} entries
      </p>

      {/* Previous and Next Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
