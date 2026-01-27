// Third Party Imports
import { useParams } from 'react-router';

// Hooks
import { useGetReviews } from '../hooks/useGetReviews';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useReviewSortContext } from '@/context/ReviewSortContext';
import { useUserReviewsContext } from '@/context/UserReviewsContext';

// Components
import PaginationControls from '@/ui/PaginationControls';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ReviewListView from './ReviewListView';
import ReviewSort from './ReviewSort';

interface ReviewContainerProps {
  mode: 'venue' | 'user';
}

function ReviewContainer({ mode }: ReviewContainerProps) {
  const isUserMode = mode === 'user';
  const isVenueMode = mode === 'venue';

  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const reviewContext = isVenueMode
    ? useReviewSortContext
    : useUserReviewsContext;

  // Fetch data from hooks
  const { sort, pagination, updatePageNumber, updateSort, resetSort } =
    reviewContext();
  const { venueId } = useParams();

  const { user, isPending: isPendingUser } = useUser();
  const userId = user?.id;

  // Fetch reviews - use mode prop to conditionally pass either
  // venueId or userId
  const {
    isPending: isPendingReviews,
    totalCount,
    reviews,
    error,
  } = useGetReviews({
    venueId: venueId ? venueId : undefined,
    userId: isUserMode ? userId : undefined,
    sort,
    pagination,
  });

  if ((isUserMode && isPendingUser) || isPendingReviews)
    return <LoaderSpinner message="Loading reviews" />;

  return reviews && reviews.length > 0 ? (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 @container ">
      <h2 className="row-start-1 text-2xl font-semibold ">Reviews</h2>
      <div className="col-span-3 row-start-2 justify-self-center @2xl:col-span-1 @2xl:row-start-1">
        <PaginationControls
          pagination={pagination}
          updatePageNumber={updatePageNumber}
          totalCount={totalCount}
        />
      </div>
      <div className="col-start-3 row-start-1 w-48 justify-self-end">
        <ReviewSort updateSort={updateSort} resetSort={resetSort} />
      </div>

      <div className="col-span-3 ">
        <ReviewListView reviews={reviews} mode={mode} />
      </div>

      <div className="col-span-3 col-start-1 justify-self-center @2xl:col-span-1 @2xl:col-start-2">
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
