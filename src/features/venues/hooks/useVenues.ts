import { useQuery } from '@tanstack/react-query';
import { getVenues } from '../../../services/apiVenues';

export function useVenues() {
  const {
    error,
    isLoading,
    data: venues,
  } = useQuery({
    queryKey: ['venues'],
    queryFn: getVenues,
  });
  return { error, isLoading, venues };
}
