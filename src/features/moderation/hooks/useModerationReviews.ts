import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getModerationReviews,
  ModerationReviewsRequestParams,
} from '@/services/apiModeration';

export function useModerationReviews({
  status = 'pending',
  filters = [],
  sort,
  pagination,
}: ModerationReviewsRequestParams = {}) {
  const { data, error, isPending } = useQuery({
    queryKey: ['moderation', 'reviews', status, filters, sort, pagination],
    queryFn: () => getModerationReviews({ status, filters, sort, pagination }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return {
    error,
    isPending,
    reviews: data?.data,
    totalCount: data?.count ?? 0,
  };
}
