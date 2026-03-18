"use client";

import { Button } from "@/components/ui/button";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface TableFooterProps {
  from: number;
  to: number;
  totalEntries: number;
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function AdminTableFooter({
  from,
  to,
  totalEntries,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: TableFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from} to {to} of {totalEntries} entries
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <FaArrowLeft className="size-3" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <FaArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}
