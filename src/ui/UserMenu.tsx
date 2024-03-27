import { useUser } from '@/features/authentication/useUser';
import Avatar from '@/features/userProfile/components/Avatar';
import styles from './UserMenu.module.css';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useLogout } from '@/features/authentication/useLogout';

function UserMenu() {
  const { user, isLoading: isLoadingUser } = useUser();
  const { logout } = useLogout();

  if (isLoadingUser) return;

  const { id } = user;

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button className={styles.buttonAvatar}>
          <Avatar userId={id} />
        </button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem>Profile</DropdownItem>
        <DropdownItem onPress={() => logout()} color="danger">
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default UserMenu;
