// Old function, currently unused

/* import { useQuery } from '@tanstack/react-query';
import { canUserReview as canUserReviewApi } from '../../../services/apiReviews';

export function useCanUserReview(
  userId: string,
  venueId: string,
  days: number,
  isEnabled: boolean
) {
  const {
    isLoading,
    data: canUserReview,
    error,
    refetch,
  } = useQuery({
    enabled: isEnabled,
    queryKey: ['can-review', userId, venueId, days],
    queryFn: () => canUserReviewApi(userId, venueId, days),
  });

  return { isLoading, error, canUserReview, refetch };
} */
