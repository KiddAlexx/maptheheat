import { useQuery } from '@tanstack/react-query';
import { getReview } from '../../../services/apiReviews';

export function useVenue(reviewId) {
  const {
    isLoading,
    data: review,
    error,
  } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => getReview(reviewId),
  });

  return { isLoading, error, review };
}
