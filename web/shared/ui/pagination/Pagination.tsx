"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@shared/lib";
import { Button } from "../button";

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, page - 1, page, page + 1, totalPages];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="페이지 이동"
      className={cn("flex items-center justify-between gap-3", className)}
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {pageNumbers.map((pageNumber, index) => {
          const previous = pageNumbers[index - 1];
          const showGap = previous !== undefined && pageNumber - previous > 1;

          return (
            <div key={pageNumber} className="flex items-center gap-2">
              {showGap ? (
                <span className="px-1 text-xs text-muted" aria-hidden="true">
                  ...
                </span>
              ) : null}
              <Button
                variant={pageNumber === page ? "primary" : "secondary"}
                size="sm"
                selected={pageNumber === page}
                onClick={() => onPageChange(pageNumber)}
                aria-current={pageNumber === page ? "page" : undefined}
              >
                {pageNumber}
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
