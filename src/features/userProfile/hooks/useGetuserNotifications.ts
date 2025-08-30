import {
  getUserNotifications,
  NotificationsRequestParams,
  NotificationsResponse,
} from '@/services/apiUserProfiles';
import { useQuery } from '@tanstack/react-query';

export function useGetUserNotifications({
  userId,
  isUnread,
  pagination,
}: NotificationsRequestParams) {
  const { isLoading, data, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', userId, isUnread, pagination],
    queryFn: () => getUserNotifications({ userId, isUnread, pagination }),
  });

  const userNotifications = data?.data;
  const totalCount = data?.count ?? 0;
  return { isLoading, error, userNotifications, totalCount };
}
