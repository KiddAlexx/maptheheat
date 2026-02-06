import { getUserCitiesSupabase } from '@/services/apiVenues';
import { UniqueCity } from '@/types/venueTypes';

import { useQuery } from '@tanstack/react-query';

export function useUserCities(favVenueList?: string[]) {
  const {
    error,
    isPending,
    data: userCities,
  } = useQuery<UniqueCity[]>({
    queryKey: ['userCities'],
    queryFn: () => getUserCitiesSupabase(favVenueList!),
    enabled: !!favVenueList,
  });

  return { error, isPending, userCities };
}
