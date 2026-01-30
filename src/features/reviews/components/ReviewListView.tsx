// Components
import ReviewListItem from './ReviewListItem';

// Type imports
import type { ReviewWithRelations } from '@/types/reviewTypes';

interface ReviewListViewProps {
  reviews: ReviewWithRelations[];
  mode: 'venue' | 'user';
}

function ReviewListView({ reviews, mode }: ReviewListViewProps) {
  return reviews?.map((review: ReviewWithRelations) => (
    <ReviewListItem review={review} mode={mode} key={review.reviewId} />
  ));
}

export default ReviewListView;
