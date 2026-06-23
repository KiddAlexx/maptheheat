import { useQuery } from '@tanstack/react-query';
import { getMyFavourites } from '@/services/apiUserProfiles';

export function useGetMyFavourites(userId?: string | null) {
  const {
    isLoading,
    data: myFavourites = [],
    error,
  } = useQuery({
    queryKey: ['myFavourites', userId],
    queryFn: getMyFavourites,
    enabled: !!userId,
  });

  return { isLoading, myFavourites, error };
}
