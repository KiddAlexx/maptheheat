import { useQuery } from '@tanstack/react-query';
import { getVenue } from '../../../services/apiVenues';
import { Venue } from '../../../types/venueTypes';

// useQuery is only enabled when venueId is truthy and isEnabled is true.
// The non-null assertion operator (!) is used when calling getVenue,
// because enabled check guarantees venueId is not null/undefined.

export function useVenue(venueId?: string, isEnabled = true) {
  const {
    isPending,
    data: venue,
    error,
  } = useQuery<Venue>({
    queryKey: ['venue', venueId],
    queryFn: () => getVenue(venueId!),
    enabled: !!venueId && isEnabled,
  });

  return { isPending, error, venue };
}
