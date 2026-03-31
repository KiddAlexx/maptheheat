// Third Party Imports
import { parseISO, format } from 'date-fns';

// Hooks
import { useUpdateUserNotification } from '../hooks/useUpdateUserNotification';
import { useDeleteUserNotification } from '../hooks/useDeleteUserNotification';

// Components
import { Button, Tooltip } from '@heroui/react';

// Assets
import { Icon } from '@iconify/react/dist/iconify.js';

// Type imports
import type { UserNotification } from '@/types/userTypes';

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
    <article className="mb-3 mt-2 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-md">
      <header className="flex justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div>
          <Tooltip content="Delete notification">
            <Button
              aria-label="Delete notification" radius="full"
              className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
              isIconOnly
              onPress={() => deleteUserNotification({ notificationId })}
              isDisabled={isUpdating || isDeleting}
            >
              <Icon
                aria-hidden="true"
                className="text-danger-600"
                icon="mingcute:delete-2-line"
                width="20"
                height="20"
              />
            </Button>
          </Tooltip>
          {notificationStatus === 'unread' && (
            <Tooltip content="Mark as read">
              <Button
                aria-label="Mark notification as read" radius="full"
                className="ml-2 h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
                isIconOnly
                onPress={() => updateUserNotification({ notificationId })}
                isDisabled={isUpdating || isDeleting}
              >
                <Icon
                  aria-hidden="true"
                  className="text-success-700"
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
