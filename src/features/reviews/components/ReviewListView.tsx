import { ReviewWithRelations } from '@/types/reviewTypes';
import ReviewListItem from './ReviewListItem';

interface ReviewListViewProps {
  reviews: ReviewWithRelations[];
}

function ReviewListView({ reviews }: ReviewListViewProps) {
  console.log(reviews);
  return reviews?.map((review: ReviewWithRelations) => (
    <ReviewListItem review={review} key={review.reviewId} />
  ));
}

export default ReviewListView;
