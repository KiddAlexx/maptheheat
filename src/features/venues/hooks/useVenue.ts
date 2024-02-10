import { useQuery } from '@tanstack/react-query';
import { getVenue } from '../../../services/apiVenues';

export function useVenue(id) {
  const {
    isLoading,
    data: venue,
    error,
  } = useQuery({
    queryKey: ['venue', id],
    queryFn: () => getVenue(id),
  });

  return { isLoading, error, venue };
}
