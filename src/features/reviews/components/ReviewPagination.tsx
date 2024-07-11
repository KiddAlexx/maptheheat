import { ReviewPaginationParams, UpdatePageNumber } from '@/types/reviewTypes';
import { Pagination } from '@nextui-org/react';

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
