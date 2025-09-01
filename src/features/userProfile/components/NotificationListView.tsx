import { UserNotification } from '@/types/userTypes';
import NotificationListItem from './NotificationListItem';

interface NotificationListViewProps {
  userNotifications: UserNotification[];
}

function NotificationListView({
  userNotifications,
}: NotificationListViewProps) {
  return userNotifications?.map((notification) => (
    <NotificationListItem
      notification={notification}
      key={notification.notificationId}
    />
  ));
}

export default NotificationListView;
