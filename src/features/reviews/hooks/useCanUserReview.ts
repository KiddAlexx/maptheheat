import { useQuery } from '@tanstack/react-query';
import { canUserReview as canUserReviewApi } from '../../../services/apiReviews';

export function useCanUserReview(userId, venueId, days, enabled) {
  const {
    isLoading,
    data: canUserReview,
    error,
    refetch,
  } = useQuery({
    enabled: enabled,
    queryKey: ['can-review', userId, venueId, days],
    queryFn: () => canUserReviewApi(userId, venueId, days),
  });

  return { isLoading, error, canUserReview, refetch };
}
