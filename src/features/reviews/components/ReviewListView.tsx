import { useParams } from 'react-router';
import ReviewListItem from './ReviewListItem';
import { useGetReviews } from '../hooks/useGetReviews';
import LoaderSpinner from '../../../ui/LoaderSpinner';
import { useUser } from '../../authentication/useUser';
import { useReviewSortContext } from '@/context/ReviewSortContext';

function ReviewListView() {
  const { venueId: venueIdParam } = useParams();
  const { sort: reviewSort, pagination: reviewPagination } =
    useReviewSortContext();
  const { isLoading: isLoadingReviews, reviews } = useGetReviews(
    venueIdParam,
    reviewSort,
    reviewPagination
  );
  const { isLoading: isLoadingUser, fetchStatus } = useUser();
  console.log(reviews);

  return isLoadingReviews || fetchStatus == 'fetching' || isLoadingUser ? (
    <LoaderSpinner />
  ) : (
    reviews?.map((review) => <ReviewListItem review={review} />)
  );
}

export default ReviewListView;
