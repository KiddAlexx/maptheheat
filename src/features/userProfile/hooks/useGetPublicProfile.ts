import { useQuery } from '@tanstack/react-query';
import { getPublicProfile } from '@/services/apiUserProfiles';

export function useGetPublicProfile(userId?: string | null) {
  const {
    isLoading,
    data: publicProfile,
    error,
  } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => getPublicProfile(userId!),
    enabled: !!userId,
  });

  return { isLoading, error, publicProfile };
}
