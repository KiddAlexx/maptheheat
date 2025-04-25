import { getUserCitiesSupabase } from '@/services/apiVenues';
import { UniqueUserCity } from '@/types/venueTypes';
import { useQuery } from '@tanstack/react-query';

export function useUserCities(favVenueList: string[]) {
  const {
    error,
    isLoading,
    data: userCities,
  } = useQuery<UniqueUserCity[]>({
    queryKey: ['userCities'],
    queryFn: () => getUserCitiesSupabase(favVenueList),
    enabled: !!favVenueList,
  });
  return { error, isLoading, userCities };
}
