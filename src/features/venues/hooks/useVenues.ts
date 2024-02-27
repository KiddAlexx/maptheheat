import { useQuery } from '@tanstack/react-query';
import { getVenues } from '../../../services/apiVenues';
import { Venue } from '../../../models/venueTypes';

export function useVenues() {
  const {
    error,
    isLoading,
    data: venues,
  } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: getVenues,
  });
  return { error, isLoading, venues };
}
