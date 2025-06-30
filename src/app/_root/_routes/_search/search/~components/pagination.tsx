import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchSchema } from "./searchSchema";

interface PostPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: SearchSchema;
}

export default function PostPagination({
  currentPage,
  totalPages,
  searchParams,
}: PostPaginationProps) {
  const neighborPages = [currentPage - 1, currentPage, currentPage + 1];
  while (neighborPages[0] < 2) {
    neighborPages.shift();
  }
  while (neighborPages[neighborPages.length - 1] > totalPages - 1) {
    neighborPages.pop();
  }

  return (
    <Pagination className="pb-4">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              to="/search"
              search={{
                ...searchParams,
                page: currentPage - 1,
              }}
            />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink
            to="/search"
            search={{
              ...searchParams,
              page: 1,
            }}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
        {currentPage >= 4 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {neighborPages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              to="/search"
              search={{
                ...searchParams,
                page,
              }}
              isActive={currentPage === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        {currentPage <= totalPages - 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink
            to="/search"
            search={{
              ...searchParams,
              page: totalPages,
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              to="/search"
              search={{
                ...searchParams,
                page: currentPage + 1,
              }}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
