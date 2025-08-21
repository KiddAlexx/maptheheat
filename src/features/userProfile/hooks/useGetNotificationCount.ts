import { getUnreadNotificationsCount } from '@/services/apiUserProfiles';
import { useQuery } from '@tanstack/react-query';

export function useGetNotificationCount({
  userId,
}: {
  userId?: string | null;
}) {
  const {
    isLoading,
    data: notificationCount,
    error,
  } = useQuery({
    queryKey: ['notificationCount', userId],
    // userId will always be defined, as enabled is false otherwise
    queryFn: () => getUnreadNotificationsCount({ userId }),
    staleTime: 0,
    refetchInterval: 10000,
    enabled: !!userId,
  });
  // return 0 when hook does not run
  // ensures correct behaviour for displaying notifications
  return { isLoading, notificationCount: notificationCount ?? 0, error };
}
