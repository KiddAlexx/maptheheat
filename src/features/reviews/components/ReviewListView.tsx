import { useParams } from 'react-router';
import ReviewListItem from './ReviewListItem';

import { useReviewSortContext } from '@/context/ReviewSortContext';

function ReviewListView({ reviews }) {
  const { venueId } = useParams();
  const { sort, pagination } = useReviewSortContext();
  return reviews?.map((review) => <ReviewListItem review={review} />);
}

export default ReviewListView;
