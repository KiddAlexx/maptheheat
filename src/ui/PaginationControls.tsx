import { UpdatePageNumber } from '@/types/reviewTypes';
import { Pagination } from '@heroui/react';

interface PaginationControlsProps {
  pagination: PaginationControlsParams;
  updatePageNumber: UpdatePageNumber;
  totalCount: number;
}

export interface PaginationControlsParams {
  pageNumber: number;
  maxResults: number;
}

function PaginationControls({
  pagination,
  updatePageNumber,
  totalCount,
}: PaginationControlsProps) {
  const { pageNumber, maxResults } = pagination;

  // Calculates total number of pages required based on the total number
  // of results divided by the maxResults per page.
  const pageCount = totalCount ? Math.ceil(totalCount / maxResults) : 0;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div className="p-2">
      <Pagination
        showControls
        total={pageCount}
        initialPage={1}
        page={pageNumber}
        onChange={updatePageNumber}
      />
    </div>
  );
}

export default PaginationControls;
