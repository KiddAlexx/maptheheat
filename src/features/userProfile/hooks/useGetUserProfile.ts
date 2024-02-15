import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../../services/apiUserProfiles';

export function useGetReviews(userId) {
  const {
    isLoading,
    data: profile,
    error,
  } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
  });

  return { isLoading, error, profile };
}
