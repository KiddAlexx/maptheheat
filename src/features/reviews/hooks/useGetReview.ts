import { useQuery } from '@tanstack/react-query';
import { getReview } from '../../../services/apiReviews';
import { ReviewWithRelations } from '@/types/reviewTypes';

// useQuery is only enabled when reviewId is truthy and isEnabled is true.
// The non-null assertion operator (!) is used when calling getReview,
// because enabled check guarantees reviewId is not null/undefined.

export function useGetReview(reviewId?: string, isEnabled = true) {
  const {
    isPending,
    data: review,
    error,
    isFetching,
  } = useQuery<ReviewWithRelations>({
    queryKey: ['review', reviewId],
    queryFn: () => getReview(reviewId!),
    enabled: !!reviewId && isEnabled,
  });

  return { isPending, isFetching, error, review };
}
