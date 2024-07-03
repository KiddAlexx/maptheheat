import { useQuery } from '@tanstack/react-query';
import { VenuesResponse, getVenues } from '../../../services/apiVenues';
import { VenueFilter, VenueSort } from '@/context/VenueFilterContext';

export function useVenues(filters: VenueFilter[], sort?: VenueSort | null) {
  const { error, isLoading, data } = useQuery<VenuesResponse>({
    queryKey: ['venues', filters, sort],
    queryFn: () => getVenues(filters, sort),
  });

  const venues = data?.data;
  const totalCount = data?.count;
  return { error, isLoading, venues, totalCount };
}
