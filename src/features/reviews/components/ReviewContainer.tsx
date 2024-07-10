import { useReviewSortContext } from '@/context/ReviewSortContext';
import ReviewListView from './ReviewListView';
import ReviewPagination from './ReviewPagination';
import ReviewSort from './ReviewSort';
import { useUserReviewsContext } from '@/context/UserReviewsContext';
import { useParams } from 'react-router';
import { useUser } from '@/features/authentication/useUser';
import LoaderSpinner from '@/ui/LoaderSpinner';
import { useGetReviews } from '../hooks/useGetReviews';

interface Props {
  mode: 'venue' | 'user';
}

function ReviewContainer({ mode }: Props) {
  // Assigns which context to use for pagination and sorting
  // based on mode prop
  const reviewContext =
    mode === 'venue' ? useReviewSortContext : useUserReviewsContext;

  // Fetch data from hooks
  const { sort, pagination } = reviewContext();
  const { venueId } = useParams();
  const { user, isLoading: isLoadingUser, fetchStatus } = useUser();
  const userId = user?.id;

  // Fetch reviews - use mode prop to conditionally pass either
  // venueId or userId
  const { isLoading: isLoadingReviews, reviews } = useGetReviews({
    venueId: mode === 'venue' ? venueId : undefined,
    userId: mode === 'user' ? userId : undefined,
    sort,
    pagination,
  });

  return isLoadingReviews || fetchStatus == 'fetching' || isLoadingUser ? (
    <LoaderSpinner />
  ) : (
    <>
      <ReviewSort />
      <ReviewPagination />
      <ReviewListView reviews={reviews} />
      <ReviewPagination />
    </>
  );
}

export default ReviewContainer;
