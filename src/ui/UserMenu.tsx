import { useUser } from '@/features/authentication/hooks/useUser';
import Avatar from '@/features/userProfile/components/Avatar';
import styles from './UserMenu.module.css';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { useLogout } from '@/features/authentication/hooks/useLogout';
import { useNavigate } from 'react-router';

function UserMenu() {
  const { user, isLoading: isLoadingUser } = useUser();
  const { logout } = useLogout();
  const navigate = useNavigate();

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
        <DropdownItem onPress={() => navigate('/profile')}>
          Profile
        </DropdownItem>
        <DropdownItem onPress={() => logout()} color="danger">
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default UserMenu;
