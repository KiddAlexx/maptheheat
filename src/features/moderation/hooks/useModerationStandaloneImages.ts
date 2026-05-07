import {
  keepPreviousData,
  useQuery,
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
  const { data, error, isPending } = useQuery({
    queryKey: ['moderation', 'standaloneImages', status, filters, pagination],
    queryFn: () =>
      getModerationStandaloneImages({ status, filters, pagination }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  return {
    error,
    imageGroups: data?.data,
    isPending,
    totalCount: data?.count ?? 0,
  };
}
