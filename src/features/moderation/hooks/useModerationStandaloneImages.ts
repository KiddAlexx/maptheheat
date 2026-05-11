import { useEffect } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getModerationStandaloneImages,
  ModerationStandaloneImagesRequestParams,
} from '@/services/apiModeration';

export function useModerationStandaloneImages({
  status = 'pending',
  filters = [],
  pagination,
}: ModerationStandaloneImagesRequestParams = {}) {
  const queryClient = useQueryClient();

  const { data, error, isPending } = useQuery({
    queryKey: ['moderation', 'standaloneImages', status, filters, pagination],
    queryFn: () =>
      getModerationStandaloneImages({ status, filters, pagination }),
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
        queryKey: ['moderation', 'standaloneImages', status, filters, next],
        queryFn: () =>
          getModerationStandaloneImages({ status, filters, pagination: next }),
      });
    }

    if (pageNumber > 1) {
      const prev = { pageNumber: pageNumber - 1, maxResults };
      queryClient.prefetchQuery({
        queryKey: ['moderation', 'standaloneImages', status, filters, prev],
        queryFn: () =>
          getModerationStandaloneImages({ status, filters, pagination: prev }),
      });
    }
  }, [
    queryClient,
    status,
    filters,
    pagination,
    pageNumber,
    maxResults,
    totalCount,
  ]);

  return {
    error,
    imageGroups: data?.data,
    isPending,
    totalCount,
  };
}
