import { useUser } from '@/features/authentication/hooks/useUser';
import Avatar from '@/features/userProfile/components/Avatar';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { useLogout } from '@/features/authentication/hooks/useLogout';
import { useNavigate } from 'react-router';
import { useGetNotificationCount } from '@/features/userProfile/hooks/useGetNotificationCount';
import { useState } from 'react';

function UserMenu() {
  const { user, isFetching: isFetchingUser } = useUser();
  const userId = user?.id;
  const { isLoading: isLoadingNotifications, notificationCount } =
    useGetNotificationCount({ userId });

  const { logout } = useLogout();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isFetchingUser || !user) return null;

  const { id } = user;

  const notificationIcon = (
    <div className="absolute -right-[2px] -top-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-xs text-success-foreground ring-1 ring-white">
      {notificationCount <= 99 ? notificationCount : '99+'}
    </div>
  );

  return (
    <Dropdown
      placement="bottom-end"
      onOpenChange={() => {
        setIsMenuOpen((isMenuOpen) => !isMenuOpen);
      }}
    >
      <DropdownTrigger>
        <button
          aria-label="Open user menu"
          className="relative  transform transition hover:brightness-90"
        >
          {!isLoadingNotifications &&
            notificationCount > 0 &&
            !isMenuOpen &&
            notificationIcon}
          <Avatar userId={id} />
        </button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile" onPress={() => navigate('/profile')}>
          Profile
        </DropdownItem>

        <DropdownItem
          key="notifications"
          onPress={() => navigate('/profile/notifications')}
          endContent={
            !isLoadingNotifications && notificationCount > 0 && notificationIcon
          }
        >
          Notifications
        </DropdownItem>
        <DropdownItem key="logout" onPress={() => logout()} color="danger">
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default UserMenu;
