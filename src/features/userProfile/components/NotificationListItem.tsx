// Third Party Imports
import { parseISO, format } from 'date-fns';
import toast from 'react-hot-toast';

// React imports
import { useEffect, useRef, useState } from 'react';

// Hooks
import { useUpdateUserNotification } from '../hooks/useUpdateUserNotification';
import { useDeleteUserNotification } from '../hooks/useDeleteUserNotification';

// Components
import { Button, Tooltip } from '@heroui/react';

// Assets
import { Icon } from '@iconify/react/dist/iconify.js';

// Type imports
import type { UserNotification } from '@/types/userTypes';

const UNDO_DELAY = 5000;

interface NotificationListItemProps {
  notification: UserNotification;
}

function NotificationListItem({ notification }: NotificationListItemProps) {
  const {
    title,
    message,
    createdAt,
    linkUrl,
    notificationId,
    notificationStatus,
  } = notification;

  const date = parseISO(createdAt);
  const formattedDate = format(date, 'dd MMM yyyy, HH:mm');

  const { isUpdating, updateUserNotification } = useUpdateUserNotification();
  const { isDeleting, deleteUserNotification } = useDeleteUserNotification();

  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout>>();

  // Clean up timer on unmount to prevent calling API after navigation
  useEffect(() => () => clearTimeout(deleteTimer.current), []);

  const isUnread = notificationStatus === 'unread';

  function handleDelete() {
    setIsPendingDelete(true);
    toast(
      (t) => (
        <span className="flex items-center gap-3">
          Notification deleted
          <button
            className="font-semibold underline"
            onClick={() => {
              clearTimeout(deleteTimer.current);
              setIsPendingDelete(false);
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { duration: UNDO_DELAY }
    );
    deleteTimer.current = setTimeout(() => {
      deleteUserNotification({ notificationId });
    }, UNDO_DELAY);
  }

  // Render nothing while pending delete — component stays mounted so
  // state and timer ref are preserved for the undo window
  if (isPendingDelete) return null;

  return (
    <article
      className={`mb-4 rounded-xl border p-3 text-sm shadow-md transition ${
        isUnread
          ? 'cursor-pointer border-success-300 bg-success-50/30 hover:border-success-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-400 focus-visible:ring-offset-2 dark:border-success-500 dark:bg-success-900/20'
          : 'border-app-border bg-app-card'
      }`}
      role={isUnread ? 'button' : undefined}
      aria-label={isUnread ? 'Mark as read' : undefined}
      onClick={
        isUnread && !isUpdating && !isDeleting
          ? () => updateUserNotification({ notificationId })
          : undefined
      }
      tabIndex={isUnread ? 0 : undefined}
      onKeyDown={
        isUnread && !isUpdating && !isDeleting
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // prevent Space from scrolling the page
                updateUserNotification({ notificationId });
              }
            }
          : undefined
      }
    >
      <header className="flex justify-between">
        <h3 className="font-semibold">{title}</h3>
        {/* stopPropagation prevents delete click from also triggering mark-as-read */}
        <div onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Delete notification">
            <Button
              aria-label="Delete notification"
              radius="full"
              className="h-auto w-auto min-w-0 bg-transparent p-0 shadow-none"
              isIconOnly
              onPress={handleDelete}
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
        </div>
      </header>
      <p className="mt-1">
        <NotificationMessage message={message} linkUrl={linkUrl} />
      </p>
      <footer className="mt-2">
        <time className="text-app-muted text-xs" dateTime={createdAt}>
          {formattedDate}
        </time>
      </footer>
    </article>
  );
}

function NotificationMessage({
  linkUrl,
  message,
}: {
  linkUrl: string | null;
  message: string;
}) {
  if (!linkUrl || !message.includes(linkUrl)) return <>{message}</>;

  const messageParts = message.split(linkUrl);

  return (
    <>
      {messageParts.map((messagePart, index) => (
        <span key={`${messagePart}-${index}`}>
          {messagePart}
          {index < messageParts.length - 1 ? (
            <a
              href={linkUrl}
              className="text-app-link break-all underline underline-offset-2 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {linkUrl}
            </a>
          ) : null}
        </span>
      ))}
    </>
  );
}

export default NotificationListItem;
