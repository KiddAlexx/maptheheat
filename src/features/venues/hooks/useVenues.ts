import { useQuery } from '@tanstack/react-query';
import { VenuesResponse, getVenues } from '../../../services/apiVenues';
import {
  VenueFilter,
  VenuePagination,
  VenueSort,
} from '@/context/VenueFilterContext';

export function useVenues(
  filters: VenueFilter[],
  sort?: VenueSort | null,
  pagination?: VenuePagination
) {
  const { error, isLoading, data } = useQuery<VenuesResponse>({
    queryKey: ['venues', filters, sort, pagination],
    queryFn: () => getVenues(filters, sort, pagination),
  });

  const venues = data?.data;
  const totalCount = data?.count;
  return { error, isLoading, venues, totalCount };
}
