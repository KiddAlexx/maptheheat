import { useQuery } from '@tanstack/react-query';
import { getPublicFavourites } from '@/services/apiUserProfiles';

export function useGetPublicFavourites(userId?: string | null) {
  const {
    isLoading,
    data: publicFavourites = [],
    error,
  } = useQuery({
    queryKey: ['publicFavourites', userId],
    queryFn: () => getPublicFavourites(userId!),
    enabled: !!userId,
  });

  return { isLoading, publicFavourites, error };
}
