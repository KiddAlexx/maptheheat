import { getUnreadNotificationsCount } from '@/services/apiUserProfiles';
import { useQuery } from '@tanstack/react-query';

export function useGetNotificationCount({ userId }: { userId: string }) {
  const {
    isLoading,
    data: notificationCount,
    error,
  } = useQuery({
    queryKey: ['notificationCount', userId],
    queryFn: () => getUnreadNotificationsCount({ userId }),
    staleTime: 0,
    refetchInterval: 10000,
  });
  return { isLoading, notificationCount, error };
}
