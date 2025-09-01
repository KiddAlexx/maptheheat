import { ReviewWithRelations } from '@/types/reviewTypes';

import ReviewListItem from './ReviewListItem';

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
