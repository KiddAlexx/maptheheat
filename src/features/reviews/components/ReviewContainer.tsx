import { useReviewSortContext } from '@/context/ReviewSortContext';
import { useUserReviewsContext } from '@/context/UserReviewsContext';

import ReviewListView from './ReviewListView';
import ReviewSort from './ReviewSort';
import LoaderSpinner from '@/ui/LoaderSpinner';

import { useParams } from 'react-router';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useGetReviews } from '../hooks/useGetReviews';
import PaginationControls from '../../../ui/PaginationControls';

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
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        <PaginationControls
          pagination={pagination}
          updatePageNumber={updatePageNumber}
          totalCount={totalCount}
        />
        <ReviewSort updateSort={updateSort} resetSort={resetSort} />
      </div>

      {isLoadingReviews || fetchStatus == 'fetching' || isLoadingUser ? (
        <LoaderSpinner />
      ) : (
        <ReviewListView reviews={reviews} />
      )}
      <div className="mt-2 flex justify-center">
        <PaginationControls
          pagination={pagination}
          updatePageNumber={updatePageNumber}
          totalCount={totalCount}
        />
      </div>
    </div>
  ) : null;
}

export default ReviewContainer;
