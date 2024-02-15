import { useParams } from 'react-router';
import ReviewListItem from './ReviewListItem';
import { useGetReviews } from '../hooks/useGetReviews';
import LoaderSpinner from '../../../ui/LoaderSpinner';

function ReviewListView() {
  const { venueId: venueIdParam } = useParams();
  const { isLoading: isLoadingReviews, reviews } = useGetReviews(venueIdParam);
  console.log(reviews);
  return isLoadingReviews ? (
    <LoaderSpinner />
  ) : (
    reviews?.map((review) => <ReviewListItem review={review} />)
  );
}

export default ReviewListView;
