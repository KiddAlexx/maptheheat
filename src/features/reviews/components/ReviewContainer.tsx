import { useReviewSortContext } from '@/context/ReviewSortContext';
import { useUserReviewsContext } from '@/context/UserReviewsContext';

import ReviewListView from './ReviewListView';
import ReviewPagination from './ReviewPagination';
import ReviewSort from './ReviewSort';
import LoaderSpinner from '@/ui/LoaderSpinner';

import { useParams } from 'react-router';
import { useUser } from '@/features/authentication/useUser';
import { useGetReviews } from '../hooks/useGetReviews';

interface ReviewContainerProps {
  mode: 'venue' | 'user';
}

function ReviewContainer({ mode }: ReviewContainerProps) {
  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const reviewContext =
    mode === 'venue' ? useReviewSortContext : useUserReviewsContext;

  // Fetch data from hooks
  const { sort, pagination, updatePageNumber, updateSort, resetSort } =
    reviewContext();
  const { venueId } = useParams();
  const { user, isLoading: isLoadingUser, fetchStatus } = useUser();
  const userId = user?.id;

  // Fetch reviews - use mode prop to conditionally pass either
  // venueId or userId
  const {
    isLoading: isLoadingReviews,
    totalCount,
    reviews,
  } = useGetReviews({
    venueId: mode === 'venue' ? venueId : undefined,
    userId: mode === 'user' ? userId : undefined,
    sort,
    pagination,
  });

  return reviews ? (
    <>
      <ReviewSort updateSort={updateSort} resetSort={resetSort} />
      <ReviewPagination
        pagination={pagination}
        updatePageNumber={updatePageNumber}
        totalCount={totalCount}
      />
      {isLoadingReviews || fetchStatus == 'fetching' || isLoadingUser ? (
        <LoaderSpinner />
      ) : (
        <ReviewListView reviews={reviews} />
      )}
      <ReviewPagination
        pagination={pagination}
        updatePageNumber={updatePageNumber}
        totalCount={totalCount}
      />
    </>
  ) : null;
}

export default ReviewContainer;
