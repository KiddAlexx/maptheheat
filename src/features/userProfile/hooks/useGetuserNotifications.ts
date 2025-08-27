import {
  getUserNotifications,
  NotificationsResponse,
} from '@/services/apiUserProfiles';
import { useQuery } from '@tanstack/react-query';

export function useGetUserNotifications({ userId }: { userId: string }) {
  const { isLoading, data, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotifications({ userId }),
  });

  const userNotifications = data?.data;
  return { isLoading, error, userNotifications };
}
