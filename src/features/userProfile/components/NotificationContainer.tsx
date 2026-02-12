// React imports
import { useState } from 'react';

// Hooks
import { useGetUserNotifications } from '../hooks/useGetuserNotifications';

// Components
import LoaderSpinner from '@/ui/LoaderSpinner';
import NotificationListView from './NotificationListView';
import { Switch } from '@heroui/react';
import PaginationControls from '@/ui/PaginationControls';

interface NotificationContainerProps {
  userId: string;
}

function NotificationContainer({ userId }: NotificationContainerProps) {
  const [isUnread, setIsUnread] = useState(false);
  const [pagination, setPagination] = useState({
    maxResults: 5,
    pageNumber: 1,
  });

  const { isPending, totalCount, userNotifications } = useGetUserNotifications({
    userId,
    isUnread,
    pagination,
  });

  function handlePageChange(pageNumber: number) {
    setPagination((prev) => ({ ...prev, pageNumber }));
  }

  function handleSelectionChange() {
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
    setIsUnread((prev) => !prev);
  }

  if (isPending) return <LoaderSpinner message="Loading notifications" />;

  return userNotifications ? (
    <div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 @container ">
        <h2 className="row-start-1 text-2xl font-semibold ">Notifications</h2>
        <div className="col-span-3 row-start-2 justify-self-center @2xl:col-span-1 @2xl:row-start-1">
          <PaginationControls
            pagination={pagination}
            totalCount={totalCount}
            updatePageNumber={handlePageChange}
          />
        </div>
        <div className="col-start-3 row-start-1 justify-self-end">
          <Switch
            isSelected={isUnread}
            onValueChange={handleSelectionChange}
            size="sm"
          >
            Unread only
          </Switch>
        </div>

        <div className="col-span-3 ">
          <NotificationListView userNotifications={userNotifications} />
        </div>
        <div className="col-span-3 col-start-1 justify-self-center @2xl:col-span-1 @2xl:col-start-2">
          <PaginationControls
            pagination={pagination}
            totalCount={totalCount}
            updatePageNumber={handlePageChange}
          />
        </div>
      </div>
    </div>
  ) : null;
}

export default NotificationContainer;
