import { UserNotification } from '@/types/userTypes';

interface NotificationListItemProps {
  notification: UserNotification;
}

function NotificationListItem({ notification }: NotificationListItemProps) {
  const { title, message } = notification;
  return (
    <div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export default NotificationListItem;
