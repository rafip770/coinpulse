"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* Returns the visible page numbers for the current position: the first page,
   a small window around the current page and the last page, with "ellipsis"
   entries in the gaps. */
const buildPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] => {
  const pages: (number | "ellipsis")[] = [1];

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");

  for (let page = start; page <= end; page++) pages.push(page);

  if (end < totalPages - 1) pages.push("ellipsis");

  if (totalPages > 1) pages.push(totalPages);

  return pages;
};

const CoinsPagination = ({
  currentPage,
  totalPages,
  hasMorePages,
}: PaginationProps) => {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/coins?page=${page}`);
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  const isLastPage = !hasMorePages || currentPage === totalPages;

  return (
    <Pagination id="coins-pagination">
      <PaginationContent className="pagination-content">
        <PaginationItem className="pagination-control prev">
          <PaginationPrevious
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            className={currentPage === 1 ? "control-disabled" : "control-btn"}
          />
        </PaginationItem>

        <div className="pagination-pages">
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <span className="ellipsis">...</span>
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  className={cn("page-link", {
                    "page-link-active": currentPage === page,
                  })}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>

        <PaginationItem className="pagination-control next">
          <PaginationNext
            onClick={() => !isLastPage && handlePageChange(currentPage + 1)}
            className={isLastPage ? "control-disabled" : "control-btn"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CoinsPagination;
