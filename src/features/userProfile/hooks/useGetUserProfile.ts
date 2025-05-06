import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../../services/apiUserProfiles';

export function useGetUserProfile(userId?: string | null) {
  const {
    isLoading,
    data: userProfile,
    error,
  } = useQuery({
    queryKey: ['profile', userId],
    // userId will always be defined, as enabled is false otherwise
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  return { isLoading, error, userProfile };
}
