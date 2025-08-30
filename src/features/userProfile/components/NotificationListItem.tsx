import { UserNotification } from '@/types/userTypes';
import { Button, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { parseISO, format } from 'date-fns';
import { useUpdateUserNotification } from '../hooks/useUpdateUserNotification';
import { useDeleteUserNotification } from '../hooks/useDeleteUserNotification';

interface NotificationListItemProps {
  notification: UserNotification;
}

function NotificationListItem({ notification }: NotificationListItemProps) {
  const { title, message, createdAt, notificationId, notificationStatus } =
    notification;

  const date = parseISO(createdAt);
  const formattedDate = format(date, 'dd MMM yyyy, HH:mm');

  const { isUpdating, updateUserNotification } = useUpdateUserNotification();
  const { isDeleting, deleteUserNotification } = useDeleteUserNotification();

  return (
    <article className="mt-2 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-md">
      <header className="flex justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div>
          <Tooltip content="Delet notification">
            <Button
              radius="none"
              className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
              isIconOnly
              onPress={() => deleteUserNotification({ notificationId })}
              isDisabled={isUpdating || isDeleting}
            >
              <Icon
                className="text-red-600"
                icon="mingcute:delete-2-line"
                width="20"
                height="20"
              />
            </Button>
          </Tooltip>
          {notificationStatus === 'unread' && (
            <Tooltip content="Mark as read">
              <Button
                radius="none"
                className="ml-2 h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
                isIconOnly
                onPress={() => updateUserNotification({ notificationId })}
                isDisabled={isUpdating || isDeleting}
              >
                <Icon
                  className="text-green-600"
                  icon="mingcute:check-fill"
                  width="20"
                  height="20"
                />
              </Button>
            </Tooltip>
          )}
        </div>
      </header>
      <p className="mt-1">{message}</p>
      <footer className="mt-2">
        <time className="text-xs text-gray-400" dateTime={createdAt}>
          {formattedDate}
        </time>
      </footer>
    </article>
  );
}

export default NotificationListItem;
