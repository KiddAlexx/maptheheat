import { useModerationCities } from './useModerationCities';
import { ModerationStatus } from '@/types/venueTypes';

interface UseModerationReviewCitiesParams {
  status?: ModerationStatus;
}

export function useModerationReviewCities({
  status = 'pending',
}: UseModerationReviewCitiesParams = {}) {
  return useModerationCities({
    scope: status === 'pending' ? 'review' : 'venue',
    status: status === 'pending' ? 'pending' : 'approved',
  });
}
