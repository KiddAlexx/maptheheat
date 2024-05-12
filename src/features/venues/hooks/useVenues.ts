import { useQuery } from '@tanstack/react-query';
import { getVenues } from '../../../services/apiVenues';
import { Venue } from '../../../models/venueTypes';
import { VenueFilter } from '@/context/VenueFilterContext';

export function useVenues(filters: VenueFilter[]) {
  const {
    error,
    isLoading,
    data: venues,
  } = useQuery<Venue[]>({
    queryKey: ['venues', filters],
    queryFn: () => getVenues(filters),
  });
  return { error, isLoading, venues };
}
