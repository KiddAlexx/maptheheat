import { useParams } from 'react-router';
import ReviewListItem from './ReviewListItem';
import { useGetReviews } from '../hooks/useGetReviews';

function ReviewListView() {
  const { venueId: venueIdParam } = useParams();
  const { isLoading, error, reviews } = useGetReviews(venueIdParam);
  console.log(reviews);
  return (
    <>
      <ReviewListItem />
    </>
  );
}

export default ReviewListView;
