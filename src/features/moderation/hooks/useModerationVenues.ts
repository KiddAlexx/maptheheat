import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getModerationVenues,
  ModerationVenuesRequestParams,
} from '@/services/apiModeration';

export function useModerationVenues({
  status = 'pending',
  filters = [],
  sort,
  pagination,
}: ModerationVenuesRequestParams = {}) {
  const { data, error, isPending } = useQuery({
    queryKey: ['moderation', 'venues', status, filters, sort, pagination],
    queryFn: () => getModerationVenues({ status, filters, sort, pagination }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return {
    error,
    isPending,
    venues: data?.data,
    totalCount: data?.count ?? 0,
  };
}
