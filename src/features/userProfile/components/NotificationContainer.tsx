import LoaderSpinner from '@/ui/LoaderSpinner';
import { useGetUserNotifications } from '../hooks/useGetuserNotifications';
import NotificationListView from './NotificationListView';

interface NotificationContainerProps {
  userId: string;
}

function NotificationContainer({ userId }: NotificationContainerProps) {
  const {
    isLoading,

    userNotifications,
  } = useGetUserNotifications({ userId });

  if (isLoading) return <LoaderSpinner />;

  return userNotifications ? (
    <div>
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <NotificationListView userNotifications={userNotifications} />
    </div>
  ) : null;
}

export default NotificationContainer;
