import { useQuery } from '@tanstack/react-query';
import { getReview } from '../../../services/apiReviews';

export function useGetReview(reviewId, isEnabled = true) {
  const {
    isLoading,
    data: review,
    error,
  } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => getReview(reviewId),
    enabled: isEnabled,
  });

  return { isLoading, error, review };
}
