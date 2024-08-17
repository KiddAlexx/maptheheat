import { getUserCitiesSupabase } from '@/services/apiVenues';
import { useQuery } from '@tanstack/react-query';

export function useUserCities(favVenueList) {
  const {
    error,
    isLoading,
    data: userCities,
  } = useQuery<string[]>({
    queryKey: ['userCities'],
    queryFn: () => getUserCitiesSupabase(favVenueList),
    enabled: !!favVenueList,
  });
  return { error, isLoading, userCities };
}
