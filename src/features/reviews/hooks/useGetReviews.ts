import { useQuery } from '@tanstack/react-query';
import { getReviews, ReviewsResponse } from '../../../services/apiReviews';
import { ReviewPagination, ReviewSort } from '@/context/ReviewSortContext';

export function useGetReviews(
  venueId: string,
  sort?: ReviewSort,
  pagination?: ReviewPagination
) {
  const { isLoading, data, error } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', venueId, sort, pagination],
    queryFn: () => getReviews(venueId, sort, pagination),
  });

  const reviews = data?.data;
  const totalCount = data?.count;
  return { error, isLoading, reviews, totalCount };
}
