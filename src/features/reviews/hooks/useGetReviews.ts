import { useQuery } from '@tanstack/react-query';
import { getReviews } from '../../../services/apiReviews';
import { Review } from '../../../models/reviewTypes';

export function useGetReviews(venueId: string) {
  const {
    isLoading,
    data: reviews,
    error,
  } = useQuery<Review[]>({
    queryKey: ['reviews', venueId],
    queryFn: () => getReviews(venueId),
  });

  return { isLoading, error, reviews };
}
