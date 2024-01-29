import { useQuery } from '@tanstack/react-query';
import { getRestaurant } from '../../../services/apiRestaurants';

export function useRestaurant(id) {
  const {
    isLoading,
    data: restaurant,
    error,
  } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurant(id),
  });

  return { isLoading, error, restaurant };
}
