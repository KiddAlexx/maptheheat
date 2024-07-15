import { useQuery } from '@tanstack/react-query';
import {
  VenuesRequestParams,
  VenuesResponse,
  getVenues,
} from '../../../services/apiVenues';

export function useVenues({ sort, filters, pagination }: VenuesRequestParams) {
  const { error, isLoading, data } = useQuery<VenuesResponse>({
    queryKey: ['venues', filters, sort, pagination],
    queryFn: () => getVenues({ filters, sort, pagination }),
  });

  const venues = data?.data;
  const totalCount = data?.count;
  return { error, isLoading, venues, totalCount };
}
