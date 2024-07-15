import { useQuery } from '@tanstack/react-query';
import {
  VenuesRequestParams,
  VenuesResponse,
  getVenues,
} from '../../../services/apiVenues';

export function useVenues({
  sort,
  filters,
  pagination,
  favouriteVenues,
}: VenuesRequestParams) {
  const { error, isLoading, data } = useQuery<VenuesResponse>({
    queryKey: ['venues', filters, sort, pagination, favouriteVenues],
    queryFn: () => getVenues({ filters, sort, pagination, favouriteVenues }),
  });

  const venues = data?.data;
  const totalCount = data?.count;
  return { error, isLoading, venues, totalCount };
}
