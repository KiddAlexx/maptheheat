import { useEffect } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data, error, isPending } = useQuery({
    queryKey: ['moderation', 'venues', status, filters, sort, pagination],
    queryFn: () => getModerationVenues({ status, filters, sort, pagination }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const totalCount = data?.count ?? 0;
  const pageNumber = pagination?.pageNumber ?? 1;
  const maxResults = pagination?.maxResults ?? 0;

  useEffect(() => {
    if (!pagination || maxResults <= 0) return;

    const pageCount = Math.ceil(totalCount / maxResults);

    if (pageNumber < pageCount) {
      const next = { pageNumber: pageNumber + 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['moderation', 'venues', status, filters, sort, next],
        queryFn: () =>
          getModerationVenues({ status, filters, sort, pagination: next }),
      });
    }

    if (pageNumber > 1) {
      const prev = { pageNumber: pageNumber - 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['moderation', 'venues', status, filters, sort, prev],
        queryFn: () =>
          getModerationVenues({ status, filters, sort, pagination: prev }),
      });
    }
  }, [
    queryClient,
    status,
    filters,
    sort,
    pagination,
    pageNumber,
    maxResults,
    totalCount,
  ]);

  return {
    error,
    isPending,
    venues: data?.data,
    totalCount,
  };
}
