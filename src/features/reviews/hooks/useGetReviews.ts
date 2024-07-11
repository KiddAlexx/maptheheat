import { useQuery } from '@tanstack/react-query';
import {
  getReviews,
  ReviewsRequestParams,
  ReviewsResponse,
} from '../../../services/apiReviews';

export function useGetReviews({
  venueId,
  userId,
  sort,
  pagination,
}: ReviewsRequestParams) {
  const { isLoading, data, error } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', venueId, userId, sort, pagination],
    queryFn: () => getReviews({ venueId, userId, sort, pagination }),
  });

  const reviews = data?.data;
  const totalCount = data?.count ?? 0;
  return { error, isLoading, reviews, totalCount };
}
