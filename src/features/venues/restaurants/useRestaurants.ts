import { useQuery } from '@tanstack/react-query';
import { getRestaurants } from '../../../services/apiRestaurants';

export function useRestaurants() {
  const {
    error,
    isLoading,
    data: restaurants,
  } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });
  return { error, isLoading, restaurants };
}
