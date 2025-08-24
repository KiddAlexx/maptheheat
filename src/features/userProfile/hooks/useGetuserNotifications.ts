import { getUserNotifications } from '@/services/apiUserProfiles';
import { useQuery } from '@tanstack/react-query';

export function useGetUserNotifications({ userId }: { userId: string }) {
  const {
    isLoading,
    data: userNotifications,
    error,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotifications({ userId }),
  });
  return { isLoading, error, userNotifications };
}
