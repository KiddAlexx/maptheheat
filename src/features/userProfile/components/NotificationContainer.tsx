import LoaderSpinner from '@/ui/LoaderSpinner';
import { useGetUserNotifications } from '../hooks/useGetuserNotifications';
import NotificationListView from './NotificationListView';
import { Switch } from '@heroui/react';
import { useState } from 'react';

interface NotificationContainerProps {
  userId: string;
}

function NotificationContainer({ userId }: NotificationContainerProps) {
  const [isUnread, setIsUnread] = useState(false);

  const {
    isLoading,

    userNotifications,
  } = useGetUserNotifications({ userId, isUnread });

  if (isLoading) return <LoaderSpinner />;

  return userNotifications ? (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <Switch isSelected={isUnread} onValueChange={setIsUnread} size="sm">
          Unread only
        </Switch>
      </div>
      <NotificationListView userNotifications={userNotifications} />
    </div>
  ) : null;
}

export default NotificationContainer;
