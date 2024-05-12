import { getUniqueCities } from '@/services/apiVenues';
import { useQuery } from '@tanstack/react-query';

export function useUniqueCities() {
  const {
    error,
    isPending,
    data: uniqueCities,
  } = useQuery<string[]>({
    queryKey: ['uniqueCities'],
    queryFn: getUniqueCities,
  });
  return { error, isPending, uniqueCities };
}
