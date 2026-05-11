import { useQuery } from '@tanstack/react-query';
import {
  getModerationCities,
  ModerationCitiesRequestParams,
} from '@/services/apiModeration';

export function useModerationCities({
  scope = 'venue',
  status = 'pending',
}: ModerationCitiesRequestParams = {}) {
  const {
    data: cities,
    error,
    isPending,
  } = useQuery({
    queryKey: ['moderation', 'cities', scope, status],
    queryFn: () => getModerationCities({ scope, status }),
    staleTime: 60_000,
  });

  return { cities, error, isPending };
}
