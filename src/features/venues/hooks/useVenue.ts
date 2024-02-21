import { useQuery } from '@tanstack/react-query';
import { getVenue } from '../../../services/apiVenues';

export function useVenue(venueId, isEnabled = true) {
  const {
    isLoading,
    data: venue,
    error,
  } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: () => getVenue(venueId),
    enabled: isEnabled,
  });

  return { isLoading, error, venue };
}
