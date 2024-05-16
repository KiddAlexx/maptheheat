import { useQuery } from '@tanstack/react-query';
import { getVenues } from '../../../services/apiVenues';
import { Venue } from '../../../models/venueTypes';
import { VenueFilter, VenueSort } from '@/context/VenueFilterContext';

export function useVenues(filters: VenueFilter[], sort: VenueSort | null) {
  const {
    error,
    isLoading,
    data: venues,
  } = useQuery<Venue[]>({
    queryKey: ['venues', filters, sort],
    queryFn: () => getVenues(filters, sort),
  });
  return { error, isLoading, venues };
}
