import { ReviewPaginationParams, UpdatePageNumber } from '@/types/reviewTypes';
import { Pagination } from '@heroui/react';

interface ReviewPaginationProps {
  pagination: ReviewPaginationParams;
  updatePageNumber: UpdatePageNumber;
  totalCount: number;
}

function ReviewPagination({
  pagination,
  updatePageNumber,
  totalCount,
}: ReviewPaginationProps) {
  const { pageNumber, maxResults } = pagination;

  // Calculates total number of pages required based on the total number
  // of results divided by the maxResults per page.
  const pageCount = totalCount ? Math.ceil(totalCount / maxResults) : 0;

  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      showControls
      total={pageCount}
      initialPage={1}
      page={pageNumber}
      onChange={updatePageNumber}
    />
  );
}

export default ReviewPagination;
