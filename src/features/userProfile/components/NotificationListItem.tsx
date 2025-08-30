import { UserNotification } from '@/types/userTypes';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { parseISO, format } from 'date-fns';

interface NotificationListItemProps {
  notification: UserNotification;
}

function NotificationListItem({ notification }: NotificationListItemProps) {
  const { title, message, createdAt } = notification;

  const date = parseISO(createdAt);
  const formattedDate = format(date, 'dd MMM yyyy, HH:mm');

  return (
    <article className="mt-2 rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-md">
      <header className="flex justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div>
          <Button
            radius="none"
            className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
            isIconOnly
          >
            <Icon
              className="text-red-600"
              icon="mingcute:delete-2-line"
              width="20"
              height="20"
            />
          </Button>
          <Button
            radius="none"
            className="ml-2 h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
            isIconOnly
          >
            <Icon
              className="text-green-600"
              icon="mingcute:check-fill"
              width="20"
              height="20"
            />
          </Button>
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
