import { useUser } from '@/features/authentication/useUser';
import Avatar from '@/features/userProfile/components/Avatar';
import styles from './UserMenu.module.css';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';

function UserMenu() {
  const { user, isLoading: isLoadingUser } = useUser();

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
        <DropdownItem>Logout</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default UserMenu;
