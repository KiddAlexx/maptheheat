import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../../services/apiUserProfiles';

export function useGetUserProfile(userId) {
  const {
    isLoading,
    data: userProfile,
    error,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
  });

  return { isLoading, error, userProfile };
}
