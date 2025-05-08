// React imports
import { NavLink } from 'react-router-dom';

// Style imports
import styles from './PageNav.module.css';
import { useUser } from '../authentication/hooks/useUser';
import { useModalContext } from '../../context/ModalContext';
import { Button } from '@heroui/button';
import UserMenu from '@/ui/UserMenu';

function PageNav() {
  const { isAuthenticated } = useUser();
  const { openModal } = useModalContext();

  return (
    <nav className="flex h-20 items-center justify-between bg-gray-900 px-40">
      <h3 className={styles.logoMain}>
        <NavLink to="/">MapTheHeat</NavLink>
      </h3>
      <ul>
        {/* Checks user login state
            Displays Login & Signup or Logout button */}
        {!isAuthenticated ? (
          <>
            <li>
              <Button size="lg" radius="sm" onPress={() => openModal('login')}>
                Login / Sign Up
              </Button>
            </li>
          </>
        ) : (
          <li>
            <UserMenu />
          </li>
        )}
      </ul>
    </nav>
  );
}

export default PageNav;
