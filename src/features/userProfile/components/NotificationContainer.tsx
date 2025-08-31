import LoaderSpinner from '@/ui/LoaderSpinner';
import { useGetUserNotifications } from '../hooks/useGetuserNotifications';
import NotificationListView from './NotificationListView';
import { Switch } from '@heroui/react';
import { useState } from 'react';
import PaginationControls from '@/ui/PaginationControls';

interface NotificationContainerProps {
  userId: string;
}

function NotificationContainer({ userId }: NotificationContainerProps) {
  const [isUnread, setIsUnread] = useState(false);
  const [pagination, setPagination] = useState({
    maxResults: 1,
    pageNumber: 1,
  });

  const { isLoading, totalCount, userNotifications } = useGetUserNotifications({
    userId,
    isUnread,
    pagination,
  });

  function handlePageChange(pageNumber: number) {
    setPagination((prev) => ({ ...prev, pageNumber }));
  }

  if (isLoading) return <LoaderSpinner />;

  return userNotifications ? (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <PaginationControls
          pagination={pagination}
          totalCount={totalCount}
          updatePageNumber={handlePageChange}
        />
        <Switch isSelected={isUnread} onValueChange={setIsUnread} size="sm">
          Unread only
        </Switch>
      </div>

      <NotificationListView userNotifications={userNotifications} />
      <div className="mt-2 flex justify-center">
        <PaginationControls
          pagination={pagination}
          totalCount={totalCount}
          updatePageNumber={handlePageChange}
        />
      </div>
    </div>
  ) : null;
}

export default NotificationContainer;
