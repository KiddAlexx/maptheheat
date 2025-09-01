import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
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
  const pageNumber = pagination?.pageNumber ?? 1;
  const maxResults = pagination?.maxResults ?? 10;

  const queryClient = useQueryClient();

  const { isLoading, data, error } = useQuery<ReviewsResponse>({
    queryKey: ['reviews', venueId, userId, sort, pagination],
    queryFn: () => getReviews({ venueId, userId, sort, pagination }),
    placeholderData: keepPreviousData,
  });

  const reviews = data?.data;
  const totalCount = data?.count ?? 0;

  const pageCount = Math.ceil(totalCount / maxResults);

  if (pageNumber < pageCount) {
    const next = { pageNumber: pageNumber + 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['reviews', venueId, userId, sort, next],
      queryFn: () => getReviews({ venueId, userId, sort, pagination: next }),
    });
  }
  if (pageNumber > 1) {
    const prev = { pageNumber: pageNumber - 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['reviews', venueId, userId, sort, prev],
      queryFn: () => getReviews({ venueId, userId, sort, pagination: prev }),
    });
  }
  return { error, isLoading, reviews, totalCount };
}
