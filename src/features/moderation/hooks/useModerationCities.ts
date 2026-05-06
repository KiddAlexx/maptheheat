import { useQuery } from '@tanstack/react-query';
import {
  getModerationCities,
  ModerationCitiesRequestParams,
} from '@/services/apiModeration';

export function useModerationCities({
  status = 'pending',
}: ModerationCitiesRequestParams = {}) {
  const {
    data: cities,
    error,
    isPending,
  } = useQuery({
    queryKey: ['moderation', 'cities', status],
    queryFn: () => getModerationCities({ status }),
    staleTime: 60_000,
  });

  return { cities, error, isPending };
}
