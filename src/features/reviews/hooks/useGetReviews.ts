import { useQuery } from '@tanstack/react-query';
import { getReviews } from '../../../services/apiReviews';

export function useGetReviews(venueId) {
  const {
    isLoading,
    data: reviews,
    error,
  } = useQuery({
    queryKey: ['reviews', venueId],
    queryFn: () => getReviews(venueId),
  });

  return { isLoading, error, reviews };
}
