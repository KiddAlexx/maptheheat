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

function UserMenu() {
  const { user, isLoading: isLoadingUser } = useUser();
  const { logout } = useLogout();
  const navigate = useNavigate();

  if (isLoadingUser) return;
  if (!user) return;

  const { id } = user;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button className="relative  transform transition hover:brightness-90">
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white ring-1 ring-white">
            9
          </div>
          <Avatar userId={id} />
        </button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="profile" onPress={() => navigate('/profile')}>
          Profile
        </DropdownItem>
        <DropdownItem key="logout" onPress={() => logout()} color="danger">
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default UserMenu;
