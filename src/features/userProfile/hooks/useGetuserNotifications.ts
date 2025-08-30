import {
  getUserNotifications,
  NotificationsRequestParams,
  NotificationsResponse,
} from '@/services/apiUserProfiles';
import { useQuery } from '@tanstack/react-query';

export function useGetUserNotifications({
  userId,
  isUnread,
}: NotificationsRequestParams) {
  const { isLoading, data, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', userId, isUnread],
    queryFn: () => getUserNotifications({ userId, isUnread }),
  });

  const userNotifications = data?.data;
  return { isLoading, error, userNotifications };
}
