import {
  getUserNotifications,
  NotificationsRequestParams,
  NotificationsResponse,
} from '@/services/apiUserProfiles';
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';

export function useGetUserNotifications({
  userId,
  isUnread,
  pagination,
}: NotificationsRequestParams) {
  const pageNumber = pagination?.pageNumber ?? 1;
  const maxResults = pagination?.maxResults ?? 10;

  const queryClient = useQueryClient();

  const { isPending, data, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications', userId, isUnread, pagination],
    queryFn: () => getUserNotifications({ userId, isUnread, pagination }),
    placeholderData: keepPreviousData,
  });

  const userNotifications = data?.data;
  const totalCount = data?.count ?? 0;

  const pageCount = Math.ceil(totalCount / maxResults);

  if (pageNumber < pageCount) {
    const next = { pageNumber: pageNumber + 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['notifications', userId, isUnread, next],
      queryFn: () =>
        getUserNotifications({ userId, isUnread, pagination: next }),
    });
  }
  if (pageNumber > 1) {
    const prev = { pageNumber: pageNumber - 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['notifications', userId, isUnread, prev],
      queryFn: () =>
        getUserNotifications({ userId, isUnread, pagination: prev }),
    });
  }
  if (!isUnread) {
    const unread = { pageNumber: 1, maxResults };
    queryClient.prefetchQuery({
      queryKey: ['notifications', userId, true, unread],
      queryFn: () =>
        getUserNotifications({ userId, isUnread: true, pagination: unread }),
    });
  }

  return { isPending, error, userNotifications, totalCount };
}
