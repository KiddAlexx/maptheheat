import { useQuery } from '@tanstack/react-query';
import {
  getModerationReviewCities,
  ModerationReviewCitiesRequestParams,
} from '@/services/apiModeration';

export function useModerationReviewCities({
  status = 'pending',
}: ModerationReviewCitiesRequestParams = {}) {
  const {
    data: cities,
    error,
    isPending,
  } = useQuery({
    queryKey: ['moderation', 'review-cities', status],
    queryFn: () => getModerationReviewCities({ status }),
    staleTime: 60_000,
  });

  return { cities, error, isPending };
}
