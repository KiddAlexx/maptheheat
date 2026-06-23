// Third Party Imports
import { useParams } from 'react-router';

// Hooks
import { useGetReviews } from '../hooks/useGetReviews';
import { useUser } from '@/features/authentication/hooks/useUser';
import { useReviewSortContext } from '@/context/ReviewSortContext';
import { useUserReviewsContext } from '@/context/UserReviewsContext';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

// Components
import PaginationControls from '@/ui/PaginationControls';
import LoaderSpinner from '@/ui/LoaderSpinner';
import ReviewListView from './ReviewListView';
import ReviewSort from './ReviewSort';

interface ReviewContainerProps {
  mode: 'venue' | 'user';
  authorUserId?: string;
}

function ReviewContainer({ mode, authorUserId }: ReviewContainerProps) {
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

  const containerRef = useRef<HTMLDivElement>(null);
  // Only scroll when the user explicitly clicks a pagination control —
  // not on mount or when the venue changes and resets the page
  const shouldScrollRef = useRef(false);

  const handlePageChange = useCallback((page: number) => {
    shouldScrollRef.current = true;
    updatePageNumber(page);
  }, [updatePageNumber]);

  // Reset to page 1 when navigating to a different venue to prevent
  // fetching a page that doesn't exist on the new venue
  useEffect(() => {
    if (isVenueMode) updatePageNumber(1);
  }, [venueId, isVenueMode, updatePageNumber]);

  useLayoutEffect(() => {
    if (!shouldScrollRef.current) return;
    shouldScrollRef.current = false;
    containerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [pagination.pageNumber]);

  const { user, isPending: isPendingUser } = useUser();
  const resolvedUserId = authorUserId ?? user?.id;

  // Fetch reviews - use mode prop to conditionally pass either
  // venueId or userId
  const {
    isPending: isPendingReviews,
    totalCount,
    reviews,
    error: reviewError,
  } = useGetReviews({
    venueId: venueId ? venueId : undefined,
    userId: isUserMode ? resolvedUserId : undefined,
    sort,
    pagination,
  });

  if ((isUserMode && !authorUserId && isPendingUser) || isPendingReviews)
    return <LoaderSpinner message="Loading reviews" />;

  if (reviewError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-app-border bg-app-card p-6 text-center shadow-md"
      >
        <p className="mb-2 text-xl font-semibold text-app-muted">
          Error loading reviews - Please try refreshing
        </p>
      </div>
    );
  }

  return reviews && reviews.length > 0 ? (
    <div
      ref={containerRef}
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 @container "
    >
      <h2 className="row-start-1 text-2xl font-semibold ">Reviews</h2>
      <div className="col-span-3 row-start-2 mt-2 justify-self-center @2xl:col-span-1 @2xl:row-start-1">
        <PaginationControls
          pagination={pagination}
          updatePageNumber={handlePageChange}
          totalCount={totalCount}
        />
      </div>
      <div className="col-start-3 row-start-1 w-48 justify-self-end">
        <ReviewSort updateSort={updateSort} resetSort={resetSort} />
      </div>

      <div className="col-span-3 ">
        <ReviewListView reviews={reviews} mode={mode} />
      </div>

      <div className="col-span-3 col-start-1 mt-2 justify-self-center @2xl:col-span-1 @2xl:col-start-2">
        <PaginationControls
          pagination={pagination}
          updatePageNumber={handlePageChange}
          totalCount={totalCount}
        />
      </div>
    </div>
  ) : null;
}

export default ReviewContainer;
