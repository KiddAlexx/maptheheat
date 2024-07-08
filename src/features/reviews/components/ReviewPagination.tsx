import { useReviewSortContext } from '@/context/ReviewSortContext';
import { Pagination } from '@nextui-org/react';
import { useParams } from 'react-router';
import { useGetReviews } from '../hooks/useGetReviews';

function ReviewPagination() {
  const { pagination, updatePageNumber } = useReviewSortContext();
  const { pageNumber, maxResults } = pagination;
  const { venueId: venueIdParam } = useParams();
  const { totalCount } = useGetReviews(venueIdParam);
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
