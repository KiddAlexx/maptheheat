import { useQuery } from '@tanstack/react-query';
import { canUserReview as canUserReviewApi } from '../../../services/apiReviews';

export function useCanUserReview(userId, venueId, days) {
  const {
    isLoading,
    data: canUserReview,
    error,
  } = useQuery({
    queryKey: ['can-review'],
    queryFn: () => canUserReviewApi(userId, venueId, days),
  });

  return { isLoading, error, canUserReview };
}
